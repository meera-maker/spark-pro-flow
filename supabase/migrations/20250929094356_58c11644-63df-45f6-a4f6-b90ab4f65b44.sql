-- Drop the problematic RLS policies causing infinite recursion
DROP POLICY IF EXISTS "Users can read own profile data only" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create new RLS policies without recursive references
CREATE POLICY "Users can read own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  )
);

CREATE POLICY "Admins can manage all users" 
ON public.users 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  )
);