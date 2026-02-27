
-- 1. Course progress tracking table
CREATE TABLE public.user_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.user_lesson_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_lesson_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON public.user_lesson_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all progress" ON public.user_lesson_progress
  FOR ALL TO authenticated USING (public.is_admin());

-- Indexes for performance at scale
CREATE INDEX idx_user_lesson_progress_user_course ON public.user_lesson_progress(user_id, course_id);
CREATE INDEX idx_user_lesson_progress_lesson ON public.user_lesson_progress(lesson_id);

-- 2. RPC function for course completion percentage
CREATE OR REPLACE FUNCTION public.get_course_progress(p_user_id uuid, p_course_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_lessons int;
  completed_lessons int;
  result json;
BEGIN
  SELECT COUNT(*) INTO total_lessons
  FROM public.course_lessons
  WHERE course_id = p_course_id AND is_published = true;

  SELECT COUNT(*) INTO completed_lessons
  FROM public.user_lesson_progress
  WHERE user_id = p_user_id AND course_id = p_course_id;

  SELECT json_build_object(
    'total', total_lessons,
    'completed', completed_lessons,
    'percentage', CASE WHEN total_lessons > 0 THEN ROUND((completed_lessons::numeric / total_lessons) * 100) ELSE 0 END
  ) INTO result;

  RETURN result;
END;
$$;

-- 3. Audit log table for admin actions
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text,
  record_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert audit log" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE INDEX idx_audit_log_admin ON public.audit_log(admin_user_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
