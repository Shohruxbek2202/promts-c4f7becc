
-- Add course_id to chat_rooms (nullable, null = general room)
ALTER TABLE public.chat_rooms ADD COLUMN course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE;

-- Create unique index so each course gets only one room
CREATE UNIQUE INDEX idx_chat_rooms_course_id ON public.chat_rooms(course_id) WHERE course_id IS NOT NULL;

-- Update RLS: course rooms visible only to course purchasers
DROP POLICY IF EXISTS "Authenticated users can view active rooms" ON public.chat_rooms;

CREATE POLICY "Users can view general active rooms"
  ON public.chat_rooms FOR SELECT
  USING (
    is_active = true AND course_id IS NULL
  );

CREATE POLICY "Users can view purchased course rooms"
  ON public.chat_rooms FOR SELECT
  USING (
    is_active = true 
    AND course_id IS NOT NULL 
    AND (
      EXISTS (
        SELECT 1 FROM public.user_courses uc 
        WHERE uc.course_id = chat_rooms.course_id 
        AND uc.user_id = auth.uid()
      )
      OR is_admin()
    )
  );

-- Also restrict messages: only see messages in rooms you can access
DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.chat_messages;

CREATE POLICY "Users can view messages in accessible rooms"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = chat_messages.room_id
      AND cr.is_active = true
      AND (
        cr.course_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.user_courses uc 
          WHERE uc.course_id = cr.course_id 
          AND uc.user_id = auth.uid()
        )
        OR is_admin()
      )
    )
  );

-- Restrict sending messages to accessible rooms only
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;

CREATE POLICY "Users can send messages in accessible rooms"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = room_id
      AND cr.is_active = true
      AND (
        cr.course_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.user_courses uc 
          WHERE uc.course_id = cr.course_id 
          AND uc.user_id = auth.uid()
        )
        OR is_admin()
      )
    )
  );

-- Trigger: auto-create chat room when course is created
CREATE OR REPLACE FUNCTION public.create_course_chat_room()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.chat_rooms (name, description, icon, course_id, is_active)
  VALUES (
    NEW.title || ' - Chat',
    NEW.title || ' kursi uchun muhokama xonasi',
    '📚',
    NEW.id,
    true
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_course_chat_room
  AFTER INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.create_course_chat_room();
