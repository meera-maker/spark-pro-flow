-- Create enhanced roles enum with all workflow roles
DO $$ BEGIN
  CREATE TYPE public.workflow_role AS ENUM (
    'Sr. CS',
    'CS',
    'Design Head',
    'Designer',
    'QC',
    'Client Serving',
    'Admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create role responsibilities table
CREATE TABLE IF NOT EXISTS public.role_responsibilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role workflow_role NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  workflow_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_responsibilities ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Everyone can read role responsibilities"
  ON public.role_responsibilities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage role responsibilities"
  ON public.role_responsibilities FOR ALL
  USING (has_role(auth.uid(), 'Admin'::app_role));

-- Insert default role responsibilities
INSERT INTO public.role_responsibilities (role, title, description, responsibilities, permissions, workflow_actions)
VALUES 
  (
    'Sr. CS'::workflow_role,
    'Senior Client Success Manager',
    'Oversees client relationships and manages the CS team',
    '[
      "Manage and mentor CS team members",
      "Handle escalated client issues",
      "Review and approve project assignments",
      "Monitor overall client satisfaction",
      "Strategic client relationship management"
    ]'::jsonb,
    '{"canViewAllProjects": true, "canAssignToCS": true, "canReassignProjects": true, "canViewReports": true}'::jsonb,
    '["Assign to CS", "Reassign Projects", "View All Projects", "Generate Reports"]'::jsonb
  ),
  (
    'CS'::workflow_role,
    'Client Success Coordinator',
    'First point of contact for clients and project coordinators',
    '[
      "Receive and process client intake forms",
      "Communicate project requirements to clients",
      "Assign projects to Design Head",
      "Track project timelines and deadlines",
      "Send project updates to clients"
    ]'::jsonb,
    '{"canViewAssignedProjects": true, "canAssignToDesignHead": true, "canCommunicateWithClients": true, "canUpdateProjectDetails": true}'::jsonb,
    '["Process Intake", "Assign to Design Head", "Client Communication", "Update Timeline"]'::jsonb
  ),
  (
    'Design Head'::workflow_role,
    'Design Team Lead',
    'Manages design team and assigns projects to designers',
    '[
      "Review project briefs and requirements",
      "Assign projects to appropriate designers",
      "Monitor design team workload",
      "Provide design direction and feedback",
      "Approve designs before QC review"
    ]'::jsonb,
    '{"canViewDesignProjects": true, "canAssignToDesigners": true, "canApproveDesigns": true, "canManageDesigners": true}'::jsonb,
    '["Assign to Designer", "Review Design", "Approve for QC", "Provide Feedback"]'::jsonb
  ),
  (
    'Designer'::workflow_role,
    'Creative Designer',
    'Creates design deliverables based on project briefs',
    '[
      "Review assigned project briefs",
      "Create design concepts and deliverables",
      "Upload design revisions",
      "Track design hours worked",
      "Submit completed work for review"
    ]'::jsonb,
    '{"canViewOwnProjects": true, "canUploadRevisions": true, "canTrackTime": true, "canSubmitForReview": true}'::jsonb,
    '["Start Design", "Upload Revision", "Track Time", "Submit for Review"]'::jsonb
  ),
  (
    'QC'::workflow_role,
    'Quality Control Specialist',
    'Reviews and approves design work for quality standards',
    '[
      "Review completed designs for quality",
      "Check adherence to brand guidelines",
      "Request revisions if needed",
      "Approve designs for client presentation",
      "Maintain quality standards documentation"
    ]'::jsonb,
    '{"canViewQCProjects": true, "canApproveDesigns": true, "canRequestRevisions": true, "canViewQualityMetrics": true}'::jsonb,
    '["Review Design", "Approve", "Request Revision", "View Metrics"]'::jsonb
  ),
  (
    'Client Serving'::workflow_role,
    'Client Relations Manager',
    'Presents work to clients and manages feedback',
    '[
      "Present approved designs to clients",
      "Collect and document client feedback",
      "Coordinate revision requests",
      "Manage client expectations",
      "Mark projects as completed after client approval"
    ]'::jsonb,
    '{"canViewClientProjects": true, "canSendToClient": true, "canCollectFeedback": true, "canMarkComplete": true}'::jsonb,
    '["Send to Client", "Collect Feedback", "Request Revision", "Mark Complete"]'::jsonb
  ),
  (
    'Admin'::workflow_role,
    'System Administrator',
    'Full system access and configuration management',
    '[
      "Manage all users and roles",
      "Configure system settings",
      "View all projects and reports",
      "Override workflow steps if needed",
      "Manage role responsibilities"
    ]'::jsonb,
    '{"fullAccess": true, "canManageUsers": true, "canManageRoles": true, "canOverrideWorkflow": true, "canViewAllData": true}'::jsonb,
    '["All Actions", "Manage Users", "Configure System", "Override Workflow"]'::jsonb
  )
ON CONFLICT (role) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  responsibilities = EXCLUDED.responsibilities,
  permissions = EXCLUDED.permissions,
  workflow_actions = EXCLUDED.workflow_actions,
  updated_at = now();

-- Create project workflow tracking table
CREATE TABLE IF NOT EXISTS public.project_workflow_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  from_role workflow_role,
  to_role workflow_role,
  from_user_id uuid,
  to_user_id uuid,
  action text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on workflow log
ALTER TABLE public.project_workflow_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow log
CREATE POLICY "Users can view workflow for their projects"
  ON public.project_workflow_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_workflow_log.project_id
      AND (
        p.designer_id = auth.uid() OR
        p.lead_id = auth.uid() OR
        p.coordinator_id = auth.uid() OR
        has_role(auth.uid(), 'Admin'::app_role)
      )
    )
  );

CREATE POLICY "System can create workflow log"
  ON public.project_workflow_log FOR INSERT
  WITH CHECK (true);

-- Add workflow_role to users table if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.users ADD COLUMN workflow_role workflow_role;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_role_responsibilities_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp
DROP TRIGGER IF EXISTS update_role_responsibilities_timestamp ON public.role_responsibilities;
CREATE TRIGGER update_role_responsibilities_timestamp
  BEFORE UPDATE ON public.role_responsibilities
  FOR EACH ROW
  EXECUTE FUNCTION update_role_responsibilities_timestamp();