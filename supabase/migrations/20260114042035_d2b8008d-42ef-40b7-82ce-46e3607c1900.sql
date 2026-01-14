-- Create a function to get public stats (prompts count, categories count, users count)
-- This is a security definer function that bypasses RLS for counting
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
    'users_count', (SELECT COUNT(*) FROM profiles)
  );
$$;