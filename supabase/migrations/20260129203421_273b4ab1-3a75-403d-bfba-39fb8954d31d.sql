-- Create prompt_ratings table for rating system
CREATE TABLE public.prompt_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);

-- Enable RLS
ALTER TABLE public.prompt_ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view ratings" ON public.prompt_ratings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate" ON public.prompt_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rating" ON public.prompt_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rating" ON public.prompt_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Add average_rating and rating_count to prompts table for caching
ALTER TABLE public.prompts 
  ADD COLUMN average_rating NUMERIC(2,1) DEFAULT 0,
  ADD COLUMN rating_count INTEGER DEFAULT 0;

-- Function to update prompt average rating
CREATE OR REPLACE FUNCTION update_prompt_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.prompts 
    SET 
      average_rating = COALESCE((SELECT AVG(rating)::NUMERIC(2,1) FROM public.prompt_ratings WHERE prompt_id = OLD.prompt_id), 0),
      rating_count = (SELECT COUNT(*) FROM public.prompt_ratings WHERE prompt_id = OLD.prompt_id)
    WHERE id = OLD.prompt_id;
    RETURN OLD;
  ELSE
    UPDATE public.prompts 
    SET 
      average_rating = COALESCE((SELECT AVG(rating)::NUMERIC(2,1) FROM public.prompt_ratings WHERE prompt_id = NEW.prompt_id), 0),
      rating_count = (SELECT COUNT(*) FROM public.prompt_ratings WHERE prompt_id = NEW.prompt_id)
    WHERE id = NEW.prompt_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.prompt_ratings
  FOR EACH ROW EXECUTE FUNCTION update_prompt_rating();

-- Update get_public_stats function to include average rating
CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users_count', (SELECT COUNT(*) FROM public.profiles),
    'prompts_count', (SELECT COUNT(*) FROM public.prompts WHERE is_published = true),
    'categories_count', (SELECT COUNT(*) FROM public.categories WHERE is_active = true),
    'lessons_count', (SELECT COUNT(*) FROM public.lessons WHERE is_published = true),
    'average_rating', (SELECT COALESCE(AVG(average_rating)::NUMERIC(2,1), 0) FROM public.prompts WHERE is_published = true AND rating_count > 0)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
