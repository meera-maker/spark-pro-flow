-- Drop existing restrictive policies and create public read access for all tables

-- Projects table: Allow public read access
DROP POLICY IF EXISTS "Users can read their assigned projects" ON public.projects;
DROP POLICY IF EXISTS "Leads and admins can manage projects" ON public.projects;

CREATE POLICY "Public can read projects"
ON public.projects
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can manage projects"
ON public.projects
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Clients table: Allow public access
DROP POLICY IF EXISTS "Deny anonymous access to clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and leads can read clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and leads can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and leads can update clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and leads can delete clients" ON public.clients;

CREATE POLICY "Public can read clients"
ON public.clients
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can manage clients"
ON public.clients
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Users table: Allow public access
DROP POLICY IF EXISTS "Deny anonymous access to users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Leads can read users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Public can read users"
ON public.users
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can manage users"
ON public.users
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Invoices table: Allow public access
DROP POLICY IF EXISTS "Admins and leads can read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins and leads can manage invoices" ON public.invoices;

CREATE POLICY "Public can read invoices"
ON public.invoices
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can manage invoices"
ON public.invoices
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Invoice items table: Allow public access
DROP POLICY IF EXISTS "Admins and leads can read invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Admins and leads can manage invoice items" ON public.invoice_items;

CREATE POLICY "Public can read invoice items"
ON public.invoice_items
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can manage invoice items"
ON public.invoice_items
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Notifications table: Allow public access
DROP POLICY IF EXISTS "Deny anonymous access to notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Public can read notifications"
ON public.notifications
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can manage notifications"
ON public.notifications
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Revisions table: Allow public access
DROP POLICY IF EXISTS "Users can read revisions for assigned projects" ON public.revisions;
DROP POLICY IF EXISTS "Designers can create revisions" ON public.revisions;

CREATE POLICY "Public can read revisions"
ON public.revisions
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can manage revisions"
ON public.revisions
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Project workflow log: Allow public access
DROP POLICY IF EXISTS "Users can view workflow for their projects" ON public.project_workflow_log;
DROP POLICY IF EXISTS "System can create workflow log" ON public.project_workflow_log;

CREATE POLICY "Public can read workflow log"
ON public.project_workflow_log
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can manage workflow log"
ON public.project_workflow_log
FOR ALL
TO public
USING (true)
WITH CHECK (true);