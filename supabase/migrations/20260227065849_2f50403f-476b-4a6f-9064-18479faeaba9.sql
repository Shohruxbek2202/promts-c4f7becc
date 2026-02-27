
-- Chat rooms
CREATE TABLE public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT '💬',
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active rooms
CREATE POLICY "Authenticated users can view active rooms"
  ON public.chat_rooms FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can manage rooms
CREATE POLICY "Admins can manage chat rooms"
  ON public.chat_rooms FOR ALL
  USING (is_admin());

-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_room_created
  ON public.chat_messages (room_id, created_at DESC);

CREATE INDEX idx_chat_messages_user
  ON public.chat_messages (user_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view messages
CREATE POLICY "Authenticated users can view messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (true);

-- Users can send messages
CREATE POLICY "Authenticated users can send messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own messages
CREATE POLICY "Users can delete own messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Seed default rooms
INSERT INTO public.chat_rooms (name, description, icon, sort_order) VALUES
  ('Umumiy', 'Umumiy suhbatlar va savollar', '💬', 0),
  ('Promptlar', 'AI promptlar haqida muhokama', '🤖', 1),
  ('Yordam', 'Texnik yordam va maslahatlar', '🆘', 2);
