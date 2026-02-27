
-- 1. Subscription reminder log table (idempotency)
CREATE TABLE public.subscription_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reminder_type text NOT NULL, -- '3_days', '1_day', 'expired'
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  subscription_type text NOT NULL,
  expires_at timestamp with time zone,
  UNIQUE(profile_id, reminder_type, expires_at)
);

-- RLS
ALTER TABLE public.subscription_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reminders"
  ON public.subscription_reminders FOR ALL
  USING (is_admin());

-- 2. Index for fast lookup of pending reminders
CREATE INDEX idx_profiles_subscription_reminder
  ON public.profiles (subscription_expires_at)
  WHERE subscription_type IN ('monthly', 'yearly', 'vip')
    AND subscription_type != 'lifetime'
    AND subscription_expires_at IS NOT NULL;

-- 3. SQL function to get users needing reminders
CREATE OR REPLACE FUNCTION public.get_subscription_reminders()
RETURNS TABLE(
  profile_id uuid,
  user_id uuid,
  email text,
  full_name text,
  subscription_type text,
  expires_at timestamptz,
  reminder_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  -- 3 days left
  SELECT p.id, p.user_id, p.email, p.full_name,
         p.subscription_type::text, p.subscription_expires_at,
         '3_days'::text AS reminder_type
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

  -- Expired (just expired, within last 24h window to catch them once)
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
