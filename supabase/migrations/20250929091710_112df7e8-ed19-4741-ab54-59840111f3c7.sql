-- Fix security issues with users and projects tables by replacing existing policies

-- Drop all existing policies for users table
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile or admins can read all" ON public.users;

-- Create a new restricted policy for users table
-- Users can only read their own profile data
-- Admins and Leads can read all user data for management purposes
CREATE POLICY "Users can read own profile data only" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('Admin', 'Lead')
  )
);

-- Drop all existing policies for projects table SELECT
DROP POLICY IF EXISTS "Users can read assigned projects" ON public.projects;
DROP POLICY IF EXISTS "Users can read assigned projects only" ON public.projects;

-- Create a new restricted policy for projects table
-- Users can only read projects where they are specifically assigned as lead_id or designer_id
-- Admins and Leads can read all projects for management purposes
CREATE POLICY "Users can only read their assigned projects" 
ON public.projects 
FOR SELECT 
USING (
  lead_id = auth.uid() 
  OR designer_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('Admin', 'Lead')
  )
);