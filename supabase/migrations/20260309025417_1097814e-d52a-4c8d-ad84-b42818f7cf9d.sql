
CREATE OR REPLACE FUNCTION public.enroll_free_course(p_course_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_course_price numeric;
  v_payment_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Verify course exists, is published, and is FREE
  SELECT price INTO v_course_price
  FROM public.courses
  WHERE id = p_course_id AND is_published = true;

  IF v_course_price IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Course not found');
  END IF;

  IF v_course_price > 0 THEN
    RETURN json_build_object('success', false, 'error', 'Course is not free');
  END IF;

  -- Check if already enrolled
  IF EXISTS (SELECT 1 FROM public.user_courses WHERE user_id = v_user_id AND course_id = p_course_id) THEN
    RETURN json_build_object('success', true, 'message', 'Already enrolled');
  END IF;

  -- Create approved payment record
  INSERT INTO public.payments (user_id, course_id, amount, status, payment_method, approved_at)
  VALUES (v_user_id, p_course_id, 0, 'approved', 'free', now())
  RETURNING id INTO v_payment_id;

  -- Enroll user
  INSERT INTO public.user_courses (user_id, course_id, payment_id)
  VALUES (v_user_id, p_course_id, v_payment_id);

  RETURN json_build_object('success', true, 'message', 'Enrolled successfully');
END;
$$;
