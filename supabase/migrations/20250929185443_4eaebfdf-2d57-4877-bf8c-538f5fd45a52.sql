-- Add comprehensive project tracking fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS serial_number INTEGER,
ADD COLUMN IF NOT EXISTS account TEXT,
ADD COLUMN IF NOT EXISTS business_unit TEXT,
ADD COLUMN IF NOT EXISTS poc TEXT,
ADD COLUMN IF NOT EXISTS project_details TEXT,
ADD COLUMN IF NOT EXISTS scope_of_work TEXT,
ADD COLUMN IF NOT EXISTS format TEXT,
ADD COLUMN IF NOT EXISTS copy_text TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS coordinator_id UUID,
ADD COLUMN IF NOT EXISTS studio TEXT,
ADD COLUMN IF NOT EXISTS portal_link TEXT,
ADD COLUMN IF NOT EXISTS version_number TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS image_editing_manipulation TEXT,
ADD COLUMN IF NOT EXISTS image_purchase TEXT,
ADD COLUMN IF NOT EXISTS additional_tasks TEXT,
ADD COLUMN IF NOT EXISTS content_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS qc_hours DECIMAL(5,2) DEFAULT 0;

-- Create sequence for serial numbers
CREATE SEQUENCE IF NOT EXISTS project_serial_seq START 1;

-- Function to auto-assign serial numbers
CREATE OR REPLACE FUNCTION assign_project_serial()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.serial_number IS NULL THEN
    NEW.serial_number := nextval('project_serial_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-assigning serial numbers
DROP TRIGGER IF EXISTS assign_project_serial_trigger ON public.projects;
CREATE TRIGGER assign_project_serial_trigger
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION assign_project_serial();

-- Add foreign key constraint for coordinator
ALTER TABLE public.projects 
ADD CONSTRAINT fk_coordinator FOREIGN KEY (coordinator_id) REFERENCES public.users(id) ON DELETE SET NULL;