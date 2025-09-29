-- Drop the problematic policies with circular references
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Create a security definer function to check user roles without recursion
CREATE OR REPLACE FUNCTION public.check_user_role(_user_id uuid, _required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = _user_id AND role = _required_role
  );
$$;

-- Create new policies using the security definer function  
CREATE POLICY "Admins can read all users" 
ON public.users 
FOR SELECT 
USING (public.check_user_role(auth.uid(), 'Admin'));

CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (public.check_user_role(auth.uid(), 'Admin'));

CREATE POLICY "Admins can update all users" 
ON public.users 
FOR UPDATE 
USING (public.check_user_role(auth.uid(), 'Admin'));

CREATE POLICY "Leads can read users"
ON public.users
FOR SELECT
USING (
  public.check_user_role(auth.uid(), 'Lead') OR 
  public.check_user_role(auth.uid(), 'Admin')
);