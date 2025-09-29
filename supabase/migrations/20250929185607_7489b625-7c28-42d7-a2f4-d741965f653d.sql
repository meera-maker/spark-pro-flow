-- Fix security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_next_revision_version(p_project_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN COALESCE((
    SELECT MAX(version_no) + 1 
    FROM revisions 
    WHERE project_id = p_project_id
  ), 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_project_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  year_part text;
  sequence_num integer;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::text;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(project_code FROM 'BOLT_' || year_part || '(\d+)') AS INTEGER)
  ), 0) + 1 INTO sequence_num
  FROM projects 
  WHERE project_code LIKE 'BOLT_' || year_part || '%';
  
  RETURN 'BOLT_' || year_part || LPAD(sequence_num::text, 4, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_role(_user_id uuid, _required_role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = _user_id AND role = _required_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  year_part text;
  sequence_num integer;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::text;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-' || year_part || '-(\d+)') AS INTEGER)
  ), 0) + 1 INTO sequence_num
  FROM invoices 
  WHERE invoice_number LIKE 'INV-' || year_part || '-%';
  
  RETURN 'INV-' || year_part || '-' || LPAD(sequence_num::text, 4, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION assign_project_serial()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.serial_number IS NULL THEN
    NEW.serial_number := nextval('project_serial_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public';