-- Create attendance tracking table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  login_time timestamp with time zone NOT NULL DEFAULT now(),
  logout_time timestamp with time zone,
  duration_hours numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance
CREATE POLICY "Users can read own attendance"
  ON public.attendance FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'Admin'::app_role));

CREATE POLICY "System can create attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attendance"
  ON public.attendance FOR UPDATE
  USING (user_id = auth.uid());

-- Add billing fields to clients table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='billing_address') THEN
    ALTER TABLE public.clients ADD COLUMN billing_address text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='tax_id') THEN
    ALTER TABLE public.clients ADD COLUMN tax_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='payment_terms') THEN
    ALTER TABLE public.clients ADD COLUMN payment_terms text DEFAULT 'Net 30';
  END IF;
END $$;

-- Trigger to calculate duration on logout
CREATE OR REPLACE FUNCTION calculate_attendance_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.logout_time IS NOT NULL AND NEW.login_time IS NOT NULL THEN
    NEW.duration_hours := EXTRACT(EPOCH FROM (NEW.logout_time - NEW.login_time)) / 3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER attendance_duration_trigger
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION calculate_attendance_duration();