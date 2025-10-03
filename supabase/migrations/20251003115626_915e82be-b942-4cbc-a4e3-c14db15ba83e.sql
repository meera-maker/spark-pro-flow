-- ============================================================
-- SECURITY FIX: Implement Proper Role-Based Access Control
-- ============================================================
-- This migration addresses privilege escalation vulnerabilities
-- by moving roles to a separate table with proper RLS policies

-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('Admin', 'Lead', 'Designer', 'QC', 'CS', 'Sr_CS');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Add foreign key constraint separately to handle existing data
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_roles
CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'Admin'
  )
);

-- 5. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Migrate existing role data from users table to user_roles table
-- Only migrate users that exist in auth.users
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 
  CASE 
    WHEN u.role = 'Admin' THEN 'Admin'::public.app_role
    WHEN u.role = 'Lead' THEN 'Lead'::public.app_role
    WHEN u.role = 'Designer' THEN 'Designer'::public.app_role
    WHEN u.role = 'QC' THEN 'QC'::public.app_role
    WHEN u.role = 'CS' THEN 'CS'::public.app_role
    WHEN u.role = 'Sr_CS' THEN 'Sr_CS'::public.app_role
  END
FROM public.users u
WHERE u.role IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = u.id)
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Update RLS policies on clients table to use new role system
DROP POLICY IF EXISTS "Team members can read clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and leads can manage clients" ON public.clients;

-- Only Admins and Leads can read client data
CREATE POLICY "Admins and leads can read clients"
ON public.clients
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

-- Only Admins and Leads can insert clients
CREATE POLICY "Admins and leads can insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

-- Only Admins and Leads can update clients
CREATE POLICY "Admins and leads can update clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

-- Only Admins and Leads can delete clients
CREATE POLICY "Admins and leads can delete clients"
ON public.clients
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

-- 8. Update other tables to use the new has_role function
-- Update invoices table policies
DROP POLICY IF EXISTS "Team members can read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins and leads can manage invoices" ON public.invoices;

CREATE POLICY "Admins and leads can read invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

CREATE POLICY "Admins and leads can manage invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

-- Update invoice_items table policies
DROP POLICY IF EXISTS "Team members can read invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Admins and leads can manage invoice items" ON public.invoice_items;

CREATE POLICY "Admins and leads can read invoice items"
ON public.invoice_items
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

CREATE POLICY "Admins and leads can manage invoice items"
ON public.invoice_items
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

-- 9. Update users table policies to use new role system
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Leads can read users" ON public.users;

CREATE POLICY "Admins can manage users"
ON public.users
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Admin'::public.app_role));

CREATE POLICY "Leads can read users"
ON public.users
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'Lead'::public.app_role) OR
  public.has_role(auth.uid(), 'Admin'::public.app_role)
);

-- Restrict what users can update in their own profile (no role changes!)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Ensure role column is not being modified
  (SELECT role FROM public.users WHERE id = auth.uid()) = role
);

-- 10. Update app_settings policies
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;

CREATE POLICY "Admins can manage settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Admin'::public.app_role));

-- 11. Update audit_logs policies
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;

CREATE POLICY "Admins can read audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'Admin'::public.app_role));

-- 12. Update projects policies to use has_role function
DROP POLICY IF EXISTS "Leads and admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Users can only read their assigned projects" ON public.projects;

CREATE POLICY "Leads and admins can manage projects"
ON public.projects
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

CREATE POLICY "Users can read their assigned projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  lead_id = auth.uid() OR 
  designer_id = auth.uid() OR 
  public.has_role(auth.uid(), 'Admin'::public.app_role) OR
  public.has_role(auth.uid(), 'Lead'::public.app_role)
);

-- 13. Update revisions policies
DROP POLICY IF EXISTS "Designers can create revisions" ON public.revisions;
DROP POLICY IF EXISTS "Users can read revisions for assigned projects" ON public.revisions;

CREATE POLICY "Users can read revisions for assigned projects"
ON public.revisions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = revisions.project_id
      AND (
        p.lead_id = auth.uid() OR
        p.designer_id = auth.uid() OR
        public.has_role(auth.uid(), 'Admin'::public.app_role) OR
        public.has_role(auth.uid(), 'Lead'::public.app_role)
      )
  )
);

CREATE POLICY "Designers can create revisions"
ON public.revisions
FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = revisions.project_id
      AND (
        p.designer_id = auth.uid() OR
        public.has_role(auth.uid(), 'Admin'::public.app_role) OR
        public.has_role(auth.uid(), 'Lead'::public.app_role)
      )
  )
);