
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = p_user_id
      AND subscription_type IN ('monthly', 'yearly', 'lifetime', 'vip')
      AND (
        subscription_type = 'lifetime'
        OR (subscription_type = 'vip' AND subscription_expires_at IS NULL)
        OR subscription_expires_at > now()
      )
  );
$$;
