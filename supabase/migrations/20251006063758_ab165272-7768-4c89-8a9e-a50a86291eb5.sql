-- Fix security issues by adding explicit authentication checks to RLS policies

-- ============================================
-- FIX 1: Users table - Prevent anonymous access to employee data
-- ============================================

-- Drop existing SELECT policies on users table
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Leads can read users" ON public.users;

-- Recreate SELECT policies with explicit authentication checks
CREATE POLICY "Users can read own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Leads can read users" 
ON public.users 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'Lead'::app_role) OR has_role(auth.uid(), 'Admin'::app_role));

-- ============================================
-- FIX 2: Clients table - Prevent anonymous access to customer data
-- ============================================

-- Drop existing policies on clients table
DROP POLICY IF EXISTS "Admins and leads can read clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and leads can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and leads can update clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and leads can delete clients" ON public.clients;

-- Recreate policies with explicit authentication checks
CREATE POLICY "Admins and leads can read clients" 
ON public.clients 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'Admin'::app_role) OR has_role(auth.uid(), 'Lead'::app_role));

CREATE POLICY "Admins and leads can insert clients" 
ON public.clients 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'Admin'::app_role) OR has_role(auth.uid(), 'Lead'::app_role));

CREATE POLICY "Admins and leads can update clients" 
ON public.clients 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'Admin'::app_role) OR has_role(auth.uid(), 'Lead'::app_role));

CREATE POLICY "Admins and leads can delete clients" 
ON public.clients 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'Admin'::app_role) OR has_role(auth.uid(), 'Lead'::app_role));

-- ============================================
-- FIX 3: Notifications table - Ensure only owner can read their notifications
-- ============================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;

-- Recreate with explicit authentication and owner check
CREATE POLICY "Users can read own notifications" 
ON public.notifications 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Add comment for clarity
COMMENT ON POLICY "Users can read own notifications" ON public.notifications IS 
'Users can only read their own notifications. Prevents anonymous access and cross-user data leakage.';