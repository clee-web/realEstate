-- Seed script to create initial admin user
-- Run this in Supabase SQL Editor after setting up the schema

-- Step 1: Update your existing user to be admin
-- Replace 'your-email@example.com' with your actual email address
UPDATE public.profiles
SET role = 'admin', is_verified = true
WHERE email = 'sokwayo@gmail.com';

-- Step 2: Verify the admin was created
SELECT id, email, full_name, role, is_verified
FROM public.profiles
WHERE role = 'admin';

-- Instructions:
-- 1. Replace 'your-email@example.com' with your signup email above
-- 2. Run this entire script in Supabase SQL Editor
-- 3. Refresh the app - you should now have admin access
