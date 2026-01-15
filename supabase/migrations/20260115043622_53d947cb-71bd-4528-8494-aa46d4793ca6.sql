-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  video_url TEXT,
  video_file_url TEXT,
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prompt_media table for videos and images
CREATE TABLE public.prompt_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image')),
  url TEXT NOT NULL,
  title TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_settings table for dynamic content
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default hero text
INSERT INTO public.site_settings (key, value) VALUES 
('hero_text', '{"title": "Professional marketing promtlari bazasi", "subtitle": "Vaqtingizni tejang, natijalaringizni oshiring."}');

-- Create storage bucket for lesson videos
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-videos', 'lesson-videos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('prompt-media', 'prompt-media', true) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Lessons policies - everyone can view published, only admins can manage
CREATE POLICY "Anyone can view published lessons" ON public.lessons FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (public.is_admin());

-- Prompt media policies
CREATE POLICY "Anyone can view prompt media" ON public.prompt_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage prompt media" ON public.prompt_media FOR ALL USING (public.is_admin());

-- Site settings policies
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- Storage policies for lesson-videos
CREATE POLICY "Anyone can view lesson videos" ON storage.objects FOR SELECT USING (bucket_id = 'lesson-videos');
CREATE POLICY "Admins can upload lesson videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lesson-videos' AND public.is_admin());
CREATE POLICY "Admins can update lesson videos" ON storage.objects FOR UPDATE USING (bucket_id = 'lesson-videos' AND public.is_admin());
CREATE POLICY "Admins can delete lesson videos" ON storage.objects FOR DELETE USING (bucket_id = 'lesson-videos' AND public.is_admin());

-- Storage policies for prompt-media
CREATE POLICY "Anyone can view prompt media files" ON storage.objects FOR SELECT USING (bucket_id = 'prompt-media');
CREATE POLICY "Admins can upload prompt media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'prompt-media' AND public.is_admin());
CREATE POLICY "Admins can update prompt media" ON storage.objects FOR UPDATE USING (bucket_id = 'prompt-media' AND public.is_admin());
CREATE POLICY "Admins can delete prompt media" ON storage.objects FOR DELETE USING (bucket_id = 'prompt-media' AND public.is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update get_public_stats to include lessons count
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'prompts_count', (SELECT COUNT(*) FROM prompts WHERE is_published = true AND is_agency_only = false),
    'categories_count', (SELECT COUNT(*) FROM categories WHERE is_active = true),
    'users_count', (SELECT COUNT(*) FROM profiles),
    'lessons_count', (SELECT COUNT(*) FROM lessons WHERE is_published = true)
  );
$$;