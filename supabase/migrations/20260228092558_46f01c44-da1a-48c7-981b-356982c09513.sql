
-- Add chat_room_icon column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS chat_room_icon text DEFAULT '📚';

-- Update the trigger function to use the course's chat_room_icon
CREATE OR REPLACE FUNCTION public.create_course_chat_room()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- On INSERT: create chat room
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.chat_rooms (name, description, icon, course_id, is_active)
    VALUES (
      NEW.title || ' - Chat',
      NEW.title || ' kursi uchun muhokama xonasi',
      COALESCE(NEW.chat_room_icon, '📚'),
      NEW.id,
      true
    );
  END IF;
  
  -- On UPDATE: sync icon and name
  IF TG_OP = 'UPDATE' THEN
    UPDATE public.chat_rooms
    SET 
      name = NEW.title || ' - Chat',
      description = NEW.title || ' kursi uchun muhokama xonasi',
      icon = COALESCE(NEW.chat_room_icon, '📚')
    WHERE course_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop old trigger if exists and recreate for INSERT and UPDATE
DROP TRIGGER IF EXISTS trg_create_course_chat_room ON public.courses;
CREATE TRIGGER trg_create_course_chat_room
  AFTER INSERT OR UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.create_course_chat_room();
