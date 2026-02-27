
-- ============================================================
-- PART 1: RATE LIMITING SYSTEM
-- ============================================================

-- Rate limits table (sliding window counter pattern)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique per key+window for upsert
CREATE UNIQUE INDEX idx_rate_limits_key_window
  ON public.rate_limits (key, window_start);

-- TTL cleanup index
CREATE INDEX idx_rate_limits_created
  ON public.rate_limits (created_at);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No direct access - only via SECURITY DEFINER functions
CREATE POLICY "No direct access to rate_limits"
  ON public.rate_limits FOR ALL
  USING (false);

-- Core rate limit check function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_max_requests int DEFAULT 10,
  p_window_seconds int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_window_start timestamptz;
  v_count int;
BEGIN
  -- Calculate current window start (floored to window boundary)
  v_window_start := date_trunc('second', now()) 
    - (EXTRACT(EPOCH FROM now())::int % p_window_seconds) * interval '1 second';

  -- Upsert: increment or create
  INSERT INTO public.rate_limits (key, window_start, request_count)
  VALUES (p_key, v_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  -- Return true if UNDER limit
  RETURN v_count <= p_max_requests;
END;
$$;

-- Cleanup function for old rate limit entries (called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.rate_limits
  WHERE created_at < now() - interval '10 minutes';
$$;

-- ============================================================
-- PART 2: SYSTEM EVENTS / MONITORING TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.system_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,  -- 'edge_function_error', 'cron_failure', 'rate_limit_exceeded', 'auth_failure'
  source text NOT NULL,      -- function name or system component
  severity text NOT NULL DEFAULT 'info',  -- 'info', 'warn', 'error', 'critical'
  message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_events_type_created
  ON public.system_events (event_type, created_at DESC);

CREATE INDEX idx_system_events_severity
  ON public.system_events (severity) WHERE severity IN ('error', 'critical');

ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view system events"
  ON public.system_events FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert system events"
  ON public.system_events FOR INSERT
  WITH CHECK (is_admin());

-- Service role bypass for edge functions (RLS bypassed by service role key anyway)
-- No additional policy needed

-- ============================================================
-- PART 3: SECURE CSV EXPORT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.export_reminders_csv(
  p_reminder_type text DEFAULT NULL,
  p_subscription_type text DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_limit int DEFAULT 10000
)
RETURNS TABLE(
  email text,
  full_name text,
  subscription_type text,
  reminder_type text,
  expires_at timestamptz,
  sent_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admin-only guard
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  -- Cap limit to 100k
  IF p_limit > 100000 THEN
    p_limit := 100000;
  END IF;

  RETURN QUERY
  SELECT
    p.email,
    p.full_name,
    sr.subscription_type,
    sr.reminder_type,
    sr.expires_at,
    sr.sent_at
  FROM public.subscription_reminders sr
  JOIN public.profiles p ON p.id = sr.profile_id
  WHERE
    (p_reminder_type IS NULL OR sr.reminder_type = p_reminder_type)
    AND (p_subscription_type IS NULL OR sr.subscription_type = p_subscription_type)
    AND (p_date_from IS NULL OR sr.sent_at >= p_date_from)
    AND (p_date_to IS NULL OR sr.sent_at <= p_date_to)
  ORDER BY sr.sent_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================
-- PART 4: ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================================

-- Composite index for filtered reminder queries
CREATE INDEX IF NOT EXISTS idx_sub_reminders_type_subtype_sent
  ON public.subscription_reminders (reminder_type, subscription_type, sent_at DESC);

-- Ensure profile_id FK is indexed (for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_sub_reminders_profile_id
  ON public.subscription_reminders (profile_id);
