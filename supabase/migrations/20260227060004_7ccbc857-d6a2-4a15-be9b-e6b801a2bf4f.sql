
-- Index to efficiently find expired subscriptions
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expiry
ON public.profiles (subscription_type, subscription_expires_at)
WHERE subscription_type IN ('monthly', 'yearly', 'vip')
  AND subscription_expires_at IS NOT NULL;

-- Expire subscriptions function
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_expired RECORD;
  v_count int := 0;
BEGIN
  FOR v_expired IN
    SELECT id, user_id, subscription_type, subscription_expires_at
    FROM public.profiles
    WHERE subscription_type IN ('monthly', 'yearly', 'vip')
      AND subscription_type != 'lifetime'
      AND subscription_expires_at IS NOT NULL
      AND subscription_expires_at < now()
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Downgrade
    UPDATE public.profiles
    SET subscription_type = 'free',
        subscription_expires_at = NULL,
        updated_at = now()
    WHERE id = v_expired.id;

    -- Audit log
    INSERT INTO public.audit_log (admin_user_id, action, table_name, record_id, details)
    VALUES (
      v_expired.user_id,
      'subscription_expired',
      'profiles',
      v_expired.id::text,
      jsonb_build_object(
        'old_subscription_type', v_expired.subscription_type,
        'expired_at', v_expired.subscription_expires_at
      )
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object('expired_count', v_count, 'executed_at', now());
END;
$$;
