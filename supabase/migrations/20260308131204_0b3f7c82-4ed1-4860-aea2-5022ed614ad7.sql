
-- 1. Make guide-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'guide-files';

-- 2. Create increment_guide_view_count RPC (atomic, no race condition)
CREATE OR REPLACE FUNCTION public.increment_guide_view_count(p_guide_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.guides SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_guide_id;
END;
$$;
