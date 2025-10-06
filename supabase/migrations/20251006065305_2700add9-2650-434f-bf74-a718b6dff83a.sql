-- Add explicit DENY policies for anonymous users on sensitive tables
-- This prevents any potential anonymous access to employee and client data

-- ============================================
-- USERS TABLE: Deny anonymous access to employee data
-- ============================================

CREATE POLICY "Deny anonymous access to users"
ON public.users
FOR SELECT
TO anon
USING (false);

-- ============================================
-- CLIENTS TABLE: Deny anonymous access to client contact information
-- ============================================

CREATE POLICY "Deny anonymous access to clients"
ON public.clients
FOR SELECT
TO anon
USING (false);

-- ============================================
-- NOTIFICATIONS TABLE: Deny anonymous access to user notifications
-- ============================================

CREATE POLICY "Deny anonymous access to notifications"
ON public.notifications
FOR SELECT
TO anon
USING (false);

-- Add comments for documentation
COMMENT ON POLICY "Deny anonymous access to users" ON public.users IS 
'Explicitly blocks anonymous users from accessing employee email addresses and names to prevent phishing attacks and social engineering.';

COMMENT ON POLICY "Deny anonymous access to clients" ON public.clients IS 
'Explicitly blocks anonymous users from accessing client contact information including emails, phone numbers, and addresses.';

COMMENT ON POLICY "Deny anonymous access to notifications" ON public.notifications IS 
'Explicitly blocks anonymous users from accessing user notifications that may contain sensitive internal communications.';