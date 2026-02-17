
-- Kurslar jadvali
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content_html TEXT,
  cover_image_url TEXT,
  instructor_name TEXT,
  instructor_bio TEXT,
  instructor_avatar_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  duration_minutes INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kurs darslari jadvali (kurs ichidagi darslar)
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content_html TEXT,
  video_url TEXT,
  video_file_url TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, slug)
);

-- Kurs materiallari (PDF, fayllar)
CREATE TABLE public.course_lesson_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Foydalanuvchi sotib olgan kurslar
CREATE TABLE public.user_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_id UUID REFERENCES public.payments(id),
  access_expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- To'lov tizimi sozlamalari (Payme, Click, manual)
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- payments jadvaliga course_id qo'shish
ALTER TABLE public.payments ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN payment_method TEXT;

-- RLS yoqish
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Courses: hamma ko'rishi mumkin, admin boshqaradi
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (is_admin());

-- Course lessons: published kursning darslari
CREATE POLICY "Anyone can view published course lessons" ON public.course_lessons FOR SELECT USING (is_published = true AND EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND is_published = true));
CREATE POLICY "Admins can manage course lessons" ON public.course_lessons FOR ALL USING (is_admin());

-- Materials: darsga kirishga ruxsat borlar ko'radi
CREATE POLICY "Anyone can view lesson materials" ON public.course_lesson_materials FOR SELECT USING (true);
CREATE POLICY "Admins can manage lesson materials" ON public.course_lesson_materials FOR ALL USING (is_admin());

-- User courses
CREATE POLICY "Users can view own courses" ON public.user_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage user courses" ON public.user_courses FOR ALL USING (is_admin());

-- Payment methods: hamma ko'radi, admin boshqaradi
CREATE POLICY "Anyone can view active payment methods" ON public.payment_methods FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods FOR ALL USING (is_admin());

-- Updated_at trigger
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Default to'lov usullarini qo'shish
INSERT INTO public.payment_methods (name, slug, is_active, config) VALUES
  ('Manual (Chek yuklash)', 'manual', true, '{"description": "Chekni yuklang va admin tasdiqlashini kuting"}'),
  ('Payme', 'payme', false, '{"merchant_id": "", "secret_key": "", "test_mode": true}'),
  ('Click', 'click', false, '{"merchant_id": "", "service_id": "", "secret_key": "", "test_mode": true}');

-- get_public_stats funksiyasini yangilash
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users_count', (SELECT COUNT(*) FROM public.profiles),
    'prompts_count', (SELECT COUNT(*) FROM public.prompts WHERE is_published = true),
    'categories_count', (SELECT COUNT(*) FROM public.categories WHERE is_active = true),
    'lessons_count', (SELECT COUNT(*) FROM public.lessons WHERE is_published = true),
    'courses_count', (SELECT COUNT(*) FROM public.courses WHERE is_published = true),
    'average_rating', (SELECT COALESCE(AVG(average_rating)::NUMERIC(2,1), 0) FROM public.prompts WHERE is_published = true AND rating_count > 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- Storage bucket for course materials
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view course materials" ON storage.objects FOR SELECT USING (bucket_id = 'course-materials');
CREATE POLICY "Admins can upload course materials" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-materials' AND public.is_admin());
CREATE POLICY "Admins can update course materials" ON storage.objects FOR UPDATE USING (bucket_id = 'course-materials' AND public.is_admin());
CREATE POLICY "Admins can delete course materials" ON storage.objects FOR DELETE USING (bucket_id = 'course-materials' AND public.is_admin());
