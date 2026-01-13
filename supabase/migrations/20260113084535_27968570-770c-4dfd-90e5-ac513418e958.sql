
-- Create settings table for storing platform configuration
CREATE TABLE public.settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view settings"
ON public.settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.settings FOR ALL
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment settings
INSERT INTO public.settings (key, value) VALUES 
('payment_settings', '{
  "card_number": "8600 0000 0000 0000",
  "card_holder": "SHOHRUX DIGITAL",
  "instructions": "To''lovni amalga oshirgandan so''ng chekni yuklang"
}'::jsonb);

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, slug, description, price, subscription_type, duration_days, features, sort_order, is_active) VALUES
('Boshlang''ich', 'starter', 'Bir oylik to''liq kirish', 49000, 'monthly', 30, '["100+ promtlar", "Oylik yangilanishlar", "Email qo''llab-quvvatlash"]'::jsonb, 1, true),
('Professional', 'professional', 'Yillik kirish bilan tejash', 399000, 'yearly', 365, '["Barcha promtlar", "Yangi promtlarga tezkor kirish", "Priority qo''llab-quvvatlash", "Telegram guruh"]'::jsonb, 2, true),
('VIP', 'vip', 'Umrbod kirish', 999000, 'lifetime', null, '["Cheksiz kirish", "Barcha promtlar", "Agentlik promtlari", "1:1 konsultatsiya", "Maxsus promtlar"]'::jsonb, 3, true);
