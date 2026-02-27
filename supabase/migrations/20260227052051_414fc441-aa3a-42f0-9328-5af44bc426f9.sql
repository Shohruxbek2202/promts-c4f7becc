
-- ================================================================
-- PART 1: FIX SELF-ENROLLMENT BYPASS ON user_courses
-- ================================================================

-- Remove the vulnerable policy that lets any user enroll themselves
DROP POLICY IF EXISTS "Users can insert own course enrollment" ON public.user_courses;

-- Create a secure enrollment RPC that validates approved payment
CREATE OR REPLACE FUNCTION public.enroll_after_payment(p_course_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_approved_payment_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if already enrolled
  IF EXISTS (SELECT 1 FROM public.user_courses WHERE user_id = v_user_id AND course_id = p_course_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already enrolled');
  END IF;

  -- Verify an approved payment exists for this user + course
  SELECT id INTO v_approved_payment_id
  FROM public.payments
  WHERE user_id = v_user_id
    AND course_id = p_course_id
    AND status = 'approved'
  ORDER BY approved_at DESC
  LIMIT 1;

  IF v_approved_payment_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No approved payment found');
  END IF;

  -- Safe to enroll (SECURITY DEFINER bypasses RLS)
  INSERT INTO public.user_courses (user_id, course_id, payment_id)
  VALUES (v_user_id, p_course_id, v_approved_payment_id);

  RETURN json_build_object('success', true, 'message', 'Enrolled successfully');
END;
$$;

-- Index for fast payment lookup during enrollment
CREATE INDEX IF NOT EXISTS idx_payments_user_course_status
  ON public.payments(user_id, course_id, status);

-- Unique constraint to prevent duplicate enrollments at DB level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_courses_user_course_unique'
  ) THEN
    ALTER TABLE public.user_courses ADD CONSTRAINT user_courses_user_course_unique UNIQUE (user_id, course_id);
  END IF;
END $$;


-- ================================================================
-- PART 2: FIX PREMIUM CONTENT DATA LEAK ON prompts
-- ================================================================

-- Helper: check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = p_user_id
      AND subscription_type IN ('monthly', 'yearly', 'lifetime', 'vip')
      AND (
        subscription_type = 'lifetime'
        OR subscription_expires_at > now()
      )
  );
$$;

-- Helper: check if user purchased a specific prompt
CREATE OR REPLACE FUNCTION public.has_purchased_prompt(p_user_id uuid, p_prompt_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_prompts
    WHERE user_id = p_user_id AND prompt_id = p_prompt_id
  );
$$;

-- Helper: check if user has active agency access
CREATE OR REPLACE FUNCTION public.has_agency_access(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = p_user_id
      AND has_agency_access = true
      AND (agency_access_expires_at IS NULL OR agency_access_expires_at > now())
  );
$$;

-- Drop vulnerable policies
DROP POLICY IF EXISTS "Anyone can view published free prompts" ON public.prompts;
DROP POLICY IF EXISTS "Authenticated users can view published prompts" ON public.prompts;

-- NEW POLICY 1: Anonymous + authenticated can see free, non-agency published prompts
CREATE POLICY "Public can view free published prompts"
ON public.prompts FOR SELECT
USING (
  is_published = true
  AND is_premium = false
  AND is_agency_only = false
);

-- NEW POLICY 2: Authenticated users can see premium IF subscribed or purchased
CREATE POLICY "Subscribers can view premium prompts"
ON public.prompts FOR SELECT
TO authenticated
USING (
  is_published = true
  AND is_agency_only = false
  AND is_premium = true
  AND (
    public.has_active_subscription(auth.uid())
    OR public.has_purchased_prompt(auth.uid(), id)
    OR public.is_admin()
  )
);

-- NEW POLICY 3: Agency-only prompts for users with agency access
CREATE POLICY "Agency users can view agency prompts"
ON public.prompts FOR SELECT
TO authenticated
USING (
  is_published = true
  AND is_agency_only = true
  AND (
    public.has_agency_access(auth.uid())
    OR public.is_admin()
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_prompts_user_prompt
  ON public.user_prompts(user_id, prompt_id);

CREATE INDEX IF NOT EXISTS idx_profiles_user_subscription
  ON public.profiles(user_id, subscription_type, subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_prompts_published_premium
  ON public.prompts(is_published, is_premium, is_agency_only);
