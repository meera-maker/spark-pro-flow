-- Create an admin user directly in the users table
INSERT INTO public.users (id, email, name, role) 
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'Admin User',
  'Admin'
);

-- Note: This creates a user record, but for full authentication, 
-- you'll still need to sign up through the app with this email