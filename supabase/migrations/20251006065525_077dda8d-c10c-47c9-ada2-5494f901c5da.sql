-- Add time tracking fields for design team
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS design_start_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS design_end_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS total_design_hours numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS designer_notes text;

-- Add function to calculate design hours
CREATE OR REPLACE FUNCTION public.calculate_design_hours()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.design_start_time IS NOT NULL AND NEW.design_end_time IS NOT NULL THEN
    NEW.total_design_hours := EXTRACT(EPOCH FROM (NEW.design_end_time - NEW.design_start_time)) / 3600;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-calculate hours
DROP TRIGGER IF EXISTS update_design_hours ON public.projects;
CREATE TRIGGER update_design_hours
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.calculate_design_hours();

-- Add comments for clarity
COMMENT ON COLUMN public.projects.design_start_time IS 'When the designer started working on the project';
COMMENT ON COLUMN public.projects.design_end_time IS 'When the designer completed work on the project';
COMMENT ON COLUMN public.projects.total_design_hours IS 'Automatically calculated total hours spent on design';
COMMENT ON COLUMN public.projects.designer_notes IS 'Notes from the designer about their work';