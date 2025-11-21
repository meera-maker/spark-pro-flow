-- Phase 1: Secure critical tables with proper RLS policies

-- ============================================
-- USERS TABLE: Proper authentication-based access
-- ============================================
DROP POLICY IF EXISTS "Public can read users" ON public.users;
DROP POLICY IF EXISTS "Public can manage users" ON public.users;

-- Users can read all user profiles (needed for workflow assignments)
CREATE POLICY "Authenticated users can read all users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only admins can insert or delete users
CREATE POLICY "Admins can insert users"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'Admin'));

CREATE POLICY "Admins can delete users"
ON public.users FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'Admin'));

-- ============================================
-- CLIENTS TABLE: Authenticated access only
-- ============================================
DROP POLICY IF EXISTS "Public can read clients" ON public.clients;
DROP POLICY IF EXISTS "Public can manage clients" ON public.clients;

-- All authenticated users can read clients (needed for project creation)
CREATE POLICY "Authenticated users can read clients"
ON public.clients FOR SELECT
TO authenticated
USING (true);

-- Admins and Leads can manage clients
CREATE POLICY "Admins and leads can manage clients"
ON public.clients FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'Admin') OR has_role(auth.uid(), 'Lead') OR has_role(auth.uid(), 'Sr_CS'))
WITH CHECK (has_role(auth.uid(), 'Admin') OR has_role(auth.uid(), 'Lead') OR has_role(auth.uid(), 'Sr_CS'));

-- ============================================
-- PROJECTS TABLE: Role-based access
-- ============================================
DROP POLICY IF EXISTS "Public can read projects" ON public.projects;
DROP POLICY IF EXISTS "Public can manage projects" ON public.projects;

-- All authenticated users can read all projects (needed for workflow visibility)
CREATE POLICY "Authenticated users can read projects"
ON public.projects FOR SELECT
TO authenticated
USING (true);

-- Leads, Admins, and Sr_CS can create projects
CREATE POLICY "Authorized roles can create projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'Admin') OR 
  has_role(auth.uid(), 'Lead') OR 
  has_role(auth.uid(), 'Sr_CS') OR
  has_role(auth.uid(), 'CS')
);

-- Assigned users, Leads, and Admins can update projects
CREATE POLICY "Assigned users and managers can update projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
  lead_id = auth.uid() OR 
  designer_id = auth.uid() OR 
  coordinator_id = auth.uid() OR
  has_role(auth.uid(), 'Admin') OR
  has_role(auth.uid(), 'Lead')
)
WITH CHECK (
  lead_id = auth.uid() OR 
  designer_id = auth.uid() OR 
  coordinator_id = auth.uid() OR
  has_role(auth.uid(), 'Admin') OR
  has_role(auth.uid(), 'Lead')
);

-- Only admins can delete projects
CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'Admin'));

-- ============================================
-- INVOICES: Admin and Lead access only
-- ============================================
DROP POLICY IF EXISTS "Public can read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Public can manage invoices" ON public.invoices;

CREATE POLICY "Authorized users can read invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'Admin') OR has_role(auth.uid(), 'Lead') OR has_role(auth.uid(), 'Sr_CS'));

CREATE POLICY "Authorized users can manage invoices"
ON public.invoices FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'Admin') OR has_role(auth.uid(), 'Lead') OR has_role(auth.uid(), 'Sr_CS'))
WITH CHECK (has_role(auth.uid(), 'Admin') OR has_role(auth.uid(), 'Lead') OR has_role(auth.uid(), 'Sr_CS'));

-- ============================================
-- INVOICE ITEMS: Admin and Lead access only
-- ============================================
DROP POLICY IF EXISTS "Public can read invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Public can manage invoice items" ON public.invoice_items;

CREATE POLICY "Authorized users can read invoice items"
ON public.invoice_items FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'Admin') OR has_role(auth.uid(), 'Lead') OR has_role(auth.uid(), 'Sr_CS'));

CREATE POLICY "Authorized users can manage invoice items"
ON public.invoice_items FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'Admin') OR has_role(auth.uid(), 'Lead') OR has_role(auth.uid(), 'Sr_CS'))
WITH CHECK (has_role(auth.uid(), 'Admin') OR has_role(auth.uid(), 'Lead') OR has_role(auth.uid(), 'Sr_CS'));

-- ============================================
-- NOTIFICATIONS: Users see only their own
-- ============================================
DROP POLICY IF EXISTS "Public can read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public can manage notifications" ON public.notifications;

CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'Admin'));

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'Admin'));

-- ============================================
-- REVISIONS: Project team members only
-- ============================================
DROP POLICY IF EXISTS "Public can read revisions" ON public.revisions;
DROP POLICY IF EXISTS "Public can manage revisions" ON public.revisions;

CREATE POLICY "Team members can read project revisions"
ON public.revisions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = revisions.project_id
    AND (
      projects.lead_id = auth.uid() OR
      projects.designer_id = auth.uid() OR
      projects.coordinator_id = auth.uid() OR
      has_role(auth.uid(), 'Admin') OR
      has_role(auth.uid(), 'QC')
    )
  )
);

CREATE POLICY "Team members can manage project revisions"
ON public.revisions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = revisions.project_id
    AND (
      projects.lead_id = auth.uid() OR
      projects.designer_id = auth.uid() OR
      projects.coordinator_id = auth.uid() OR
      has_role(auth.uid(), 'Admin') OR
      has_role(auth.uid(), 'QC')
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = revisions.project_id
    AND (
      projects.lead_id = auth.uid() OR
      projects.designer_id = auth.uid() OR
      projects.coordinator_id = auth.uid() OR
      has_role(auth.uid(), 'Admin') OR
      has_role(auth.uid(), 'QC')
    )
  )
);

-- ============================================
-- WORKFLOW LOGS: All authenticated users can read
-- ============================================
DROP POLICY IF EXISTS "Public can read workflow log" ON public.project_workflow_log;
DROP POLICY IF EXISTS "Public can manage workflow log" ON public.project_workflow_log;

CREATE POLICY "Authenticated users can read workflow logs"
ON public.project_workflow_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create workflow logs"
ON public.project_workflow_log FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only admins can update workflow logs"
ON public.project_workflow_log FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'Admin'))
WITH CHECK (has_role(auth.uid(), 'Admin'));

CREATE POLICY "Only admins can delete workflow logs"
ON public.project_workflow_log FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'Admin'));