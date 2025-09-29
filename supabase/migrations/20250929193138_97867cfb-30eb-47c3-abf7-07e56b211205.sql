-- Create user record for the currently authenticated user
INSERT INTO public.users (id, name, email, role) VALUES 
('70322373-ccf9-4eb4-84db-98ec45b28f97', 'Meenakshi', 'meenakshi@spc.com', 'Admin')
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
email = EXCLUDED.email,
role = EXCLUDED.role;

-- Update sample project assignments to include the real user
UPDATE public.projects 
SET lead_id = '70322373-ccf9-4eb4-84db-98ec45b28f97'
WHERE project_code = 'BOLT_20250001';

UPDATE public.projects 
SET coordinator_id = '70322373-ccf9-4eb4-84db-98ec45b28f97'
WHERE project_code = 'BOLT_20250002';

-- Add notifications for the real user (using gen_random_uuid())
INSERT INTO public.notifications (user_id, type, title, message, payload, read_flag) VALUES 
('70322373-ccf9-4eb4-84db-98ec45b28f97', 'assignment', 'Welcome to the Workflow System', 'You have been added as an Admin user with full access to all projects and workflows', '{"action": "welcome", "role": "Admin"}', false);