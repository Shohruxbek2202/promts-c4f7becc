
-- Drop the overly permissive policy and create a more restrictive one via a function
DROP POLICY "Anyone can increment prompt counters" ON public.prompts;

-- Create a security definer function to increment counters
CREATE OR REPLACE FUNCTION public.increment_prompt_view_count(prompt_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.prompts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = prompt_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_prompt_copy_count(prompt_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.prompts SET copy_count = COALESCE(copy_count, 0) + 1 WHERE id = prompt_id;
END;
$$;
