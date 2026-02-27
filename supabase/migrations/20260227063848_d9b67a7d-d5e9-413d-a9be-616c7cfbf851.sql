
-- Fix: Change view to use SECURITY INVOKER (default, safe)
DROP VIEW IF EXISTS public.subscription_reminder_report;
CREATE VIEW public.subscription_reminder_report
WITH (security_invoker = true)
AS
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
