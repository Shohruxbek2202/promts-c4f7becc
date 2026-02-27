
-- 1. Reporting view: subscription_reminder_report
CREATE OR REPLACE VIEW public.subscription_reminder_report AS
SELECT
  p.email,
  p.full_name,
  p.subscription_type,
  sr.reminder_type,
  sr.expires_at,
  sr.sent_at,
  CASE
    WHEN sr.expires_at IS NOT NULL
    THEN EXTRACT(DAY FROM sr.expires_at - sr.sent_at)::int
    ELSE NULL
  END AS days_until_expiry
FROM public.subscription_reminders sr
JOIN public.profiles p ON p.id = sr.profile_id
ORDER BY sr.sent_at DESC;

-- 2. Summary function for dashboard stats
CREATE OR REPLACE FUNCTION public.get_reminder_summary()
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'sent_today', (SELECT COUNT(*) FROM subscription_reminders WHERE sent_at::date = CURRENT_DATE),
    'sent_this_week', (SELECT COUNT(*) FROM subscription_reminders WHERE sent_at >= date_trunc('week', CURRENT_DATE)),
    'count_7_days', (SELECT COUNT(*) FROM subscription_reminders WHERE reminder_type = '7_days'),
    'count_3_days', (SELECT COUNT(*) FROM subscription_reminders WHERE reminder_type = '3_days'),
    'count_1_day', (SELECT COUNT(*) FROM subscription_reminders WHERE reminder_type = '1_day'),
    'count_expired', (SELECT COUNT(*) FROM subscription_reminders WHERE reminder_type = 'expired')
  );
$$;

-- 3. Extend get_subscription_reminders() with 7_days support
CREATE OR REPLACE FUNCTION public.get_subscription_reminders()
RETURNS TABLE(profile_id uuid, user_id uuid, email text, full_name text, subscription_type text, expires_at timestamptz, reminder_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY

  -- 7 days left
  SELECT p.id, p.user_id, p.email, p.full_name,
         p.subscription_type::text, p.subscription_expires_at,
         '7_days'::text AS reminder_type
  FROM public.profiles p
  WHERE p.subscription_type IN ('monthly', 'yearly', 'vip')
    AND p.subscription_expires_at IS NOT NULL
    AND p.subscription_expires_at::date = (CURRENT_DATE + INTERVAL '7 days')
    AND NOT EXISTS (
      SELECT 1 FROM public.subscription_reminders sr
      WHERE sr.profile_id = p.id
        AND sr.reminder_type = '7_days'
        AND sr.expires_at = p.subscription_expires_at
    )

  UNION ALL

  -- 3 days left
  SELECT p.id, p.user_id, p.email, p.full_name,
         p.subscription_type::text, p.subscription_expires_at,
         '3_days'::text
  FROM public.profiles p
  WHERE p.subscription_type IN ('monthly', 'yearly', 'vip')
    AND p.subscription_expires_at IS NOT NULL
    AND p.subscription_expires_at::date = (CURRENT_DATE + INTERVAL '3 days')
    AND NOT EXISTS (
      SELECT 1 FROM public.subscription_reminders sr
      WHERE sr.profile_id = p.id
        AND sr.reminder_type = '3_days'
        AND sr.expires_at = p.subscription_expires_at
    )

  UNION ALL

  -- 1 day left
  SELECT p.id, p.user_id, p.email, p.full_name,
         p.subscription_type::text, p.subscription_expires_at,
         '1_day'::text
  FROM public.profiles p
  WHERE p.subscription_type IN ('monthly', 'yearly', 'vip')
    AND p.subscription_expires_at IS NOT NULL
    AND p.subscription_expires_at::date = (CURRENT_DATE + INTERVAL '1 day')
    AND NOT EXISTS (
      SELECT 1 FROM public.subscription_reminders sr
      WHERE sr.profile_id = p.id
        AND sr.reminder_type = '1_day'
        AND sr.expires_at = p.subscription_expires_at
    )

  UNION ALL

  -- Expired (within 48h window)
  SELECT p.id, p.user_id, p.email, p.full_name,
         p.subscription_type::text, p.subscription_expires_at,
         'expired'::text
  FROM public.profiles p
  WHERE p.subscription_type IN ('monthly', 'yearly', 'vip')
    AND p.subscription_expires_at IS NOT NULL
    AND p.subscription_expires_at < now()
    AND p.subscription_expires_at > now() - INTERVAL '2 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.subscription_reminders sr
      WHERE sr.profile_id = p.id
        AND sr.reminder_type = 'expired'
        AND sr.expires_at = p.subscription_expires_at
    );
END;
$$;

-- 4. Index on sent_at for reporting queries
CREATE INDEX IF NOT EXISTS idx_subscription_reminders_sent_at
ON public.subscription_reminders (sent_at DESC);

-- 5. Index on reminder_type for summary counts
CREATE INDEX IF NOT EXISTS idx_subscription_reminders_type
ON public.subscription_reminders (reminder_type);
