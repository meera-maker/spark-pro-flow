-- Fix projects RLS policies to allow authenticated users to read all projects
-- Only restrict who can modify projects

DROP POLICY IF EXISTS "Users can read assigned projects" ON public.projects;

-- Allow all authenticated users to read all projects (for team visibility)
CREATE POLICY "Authenticated users can read all projects"
ON public.projects FOR SELECT
TO authenticated
USING (true);

-- Admins and Leads can manage all projects
-- Assigned users can update their specific projects
CREATE POLICY "Authorized users can manage projects"
ON public.projects FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'Admin') OR 
  has_role(auth.uid(), 'Lead') OR
  lead_id = auth.uid() OR 
  designer_id = auth.uid() OR 
  coordinator_id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'Admin') OR 
  has_role(auth.uid(), 'Lead') OR
  has_role(auth.uid(), 'Sr_CS') OR
  has_role(auth.uid(), 'CS')
);