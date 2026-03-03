
-- Qo'llanmalar jadvali
CREATE TABLE public.guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content_html TEXT,
  category_id UUID REFERENCES public.categories(id),
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  price NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Qo'llanma fayllari
CREATE TABLE public.guide_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sotib olingan qo'llanmalar
CREATE TABLE public.user_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, guide_id)
);

-- RLS yoqish
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_guides ENABLE ROW LEVEL SECURITY;

-- Guides RLS
CREATE POLICY "Admins can manage guides" ON public.guides FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view published guides" ON public.guides FOR SELECT USING (is_published = true);

-- Guide files RLS
CREATE POLICY "Admins can manage guide files" ON public.guide_files FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view guide files" ON public.guide_files FOR SELECT USING (true);

-- User guides RLS
CREATE POLICY "Admins can manage user guides" ON public.user_guides FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view own guides" ON public.user_guides FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own guides" ON public.user_guides FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Purchased guide tekshirish funksiyasi
CREATE OR REPLACE FUNCTION public.has_purchased_guide(p_user_id UUID, p_guide_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_guides WHERE user_id = p_user_id AND guide_id = p_guide_id
  );
$$;

-- Updated_at trigger
CREATE TRIGGER update_guides_updated_at
  BEFORE UPDATE ON public.guides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for guide files
INSERT INTO storage.buckets (id, name, public) VALUES ('guide-files', 'guide-files', true);

CREATE POLICY "Admins can upload guide files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'guide-files' AND public.is_admin());
CREATE POLICY "Admins can update guide files" ON storage.objects FOR UPDATE USING (bucket_id = 'guide-files' AND public.is_admin());
CREATE POLICY "Admins can delete guide files" ON storage.objects FOR DELETE USING (bucket_id = 'guide-files' AND public.is_admin());
CREATE POLICY "Anyone can view guide files storage" ON storage.objects FOR SELECT USING (bucket_id = 'guide-files');
