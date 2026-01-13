-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Create policy for users to upload their own receipts
CREATE POLICY "Users can upload their own receipts"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to view their own receipts
CREATE POLICY "Users can view their own receipts"
ON storage.objects
FOR SELECT
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can view all receipts
CREATE POLICY "Admins can view all receipts"
ON storage.objects
FOR SELECT
USING (bucket_id = 'receipts' AND public.is_admin());