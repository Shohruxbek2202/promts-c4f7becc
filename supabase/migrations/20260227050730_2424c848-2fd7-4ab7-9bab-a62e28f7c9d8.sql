
CREATE OR REPLACE FUNCTION public.get_course_enrolled_counts(course_ids uuid[])
RETURNS TABLE(course_id uuid, enrolled_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT uc.course_id, COUNT(*)::bigint as enrolled_count
  FROM public.user_courses uc
  WHERE uc.course_id = ANY(course_ids)
  GROUP BY uc.course_id;
$$;
