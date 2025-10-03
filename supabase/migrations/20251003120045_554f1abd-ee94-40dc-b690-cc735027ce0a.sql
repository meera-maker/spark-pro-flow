-- Fix infinite recursion in user_roles RLS policy
-- The issue: The admin policy queries user_roles table while checking permissions on user_roles table

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create a simpler policy that doesn't cause recursion
-- Only allow inserts/updates/deletes through the application with proper checks
-- Admins will need to use the has_role function in application code
CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  -- Allow if the requesting user is modifying their own roles (for SELECT)
  user_id = auth.uid()
)
WITH CHECK (
  -- For INSERT/UPDATE/DELETE, we'll handle permissions at the application level
  -- This prevents the infinite recursion issue
  false
);

-- Allow SELECT for users to read their own roles
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;

CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create a separate policy for service role to manage roles
-- This will be used by admin functions only
CREATE POLICY "Admins can insert roles via function"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if current user has admin role using a different approach
  -- We'll rely on application-level checks with has_role function
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'is_admin' = 'true'
  )
);