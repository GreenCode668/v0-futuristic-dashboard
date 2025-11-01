-- Fix: Allow authenticated users to create tenants during onboarding
-- This policy allows any authenticated user to create a new tenant

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can create tenants" ON tenants;

-- Allow authenticated users to create tenants
CREATE POLICY "Authenticated users can create tenants"
  ON tenants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to create their tenant relationships
DROP POLICY IF EXISTS "Users can create tenant relationships" ON user_tenants;

CREATE POLICY "Users can create tenant relationships"
  ON user_tenants FOR INSERT
  WITH CHECK (auth.uid() = user_id);
