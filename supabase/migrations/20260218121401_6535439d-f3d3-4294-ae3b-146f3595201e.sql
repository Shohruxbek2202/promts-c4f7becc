
-- Referral yechib olish so'rovlari jadvali
CREATE TABLE public.referral_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'cash', -- 'cash' | 'subscription'
  plan_id UUID REFERENCES public.pricing_plans(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  card_number TEXT,
  card_holder TEXT,
  admin_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.referral_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals"
ON public.referral_withdrawals FOR SELECT
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own withdrawals"
ON public.referral_withdrawals FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all withdrawals"
ON public.referral_withdrawals FOR ALL
USING (is_admin());

-- updated_at trigger
CREATE TRIGGER update_referral_withdrawals_updated_at
BEFORE UPDATE ON public.referral_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
