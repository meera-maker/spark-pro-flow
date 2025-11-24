-- Fix clients RLS policy by first dropping all existing policies
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'clients' AND schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.clients', r.policyname);
  END LOOP;
END $$;

-- Create new separate policies for better clarity
CREATE POLICY "Authenticated users can read clients"
ON public.clients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authorized users can insert clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'Admin') OR 
  has_role(auth.uid(), 'Lead') OR 
  has_role(auth.uid(), 'Sr_CS') OR
  has_role(auth.uid(), 'CS')
);

CREATE POLICY "Authorized users can update clients"
ON public.clients FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'Admin') OR 
  has_role(auth.uid(), 'Lead') OR 
  has_role(auth.uid(), 'Sr_CS')
)
WITH CHECK (
  has_role(auth.uid(), 'Admin') OR 
  has_role(auth.uid(), 'Lead') OR 
  has_role(auth.uid(), 'Sr_CS')
);

CREATE POLICY "Admins can delete clients"
ON public.clients FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'Admin'));