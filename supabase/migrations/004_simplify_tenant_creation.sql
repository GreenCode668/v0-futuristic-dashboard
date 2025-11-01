-- Simplify tenant creation by allowing any authenticated user to create tenants
-- This is safe because users can only create, not view others' tenants

-- First, let's check what policies exist
-- Run this to see current policies:
-- SELECT * FROM pg_policies WHERE tablename IN ('tenants', 'users', 'user_tenants', 'accounts', 'categories');

-- Remove ALL existing policies and recreate them properly
-- TENANTS table policies
DROP POLICY IF EXISTS "Users can view their tenants" ON tenants;
DROP POLICY IF EXISTS "Owners can update tenants" ON tenants;
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON tenants;

-- Allow any authenticated user to INSERT a tenant (during onboarding)
CREATE POLICY "Anyone authenticated can create tenant"
  ON tenants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view only their tenants
CREATE POLICY "Users view own tenants"
  ON tenants FOR SELECT
  TO authenticated
  USING (id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- Allow owners to update their tenants
CREATE POLICY "Owners update own tenants"
  ON tenants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND tenant_id = tenants.id
      AND role IN ('owner', 'admin')
    )
  );

-- USERS table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- USER_TENANTS table policies
DROP POLICY IF EXISTS "Users can view own tenant relationships" ON user_tenants;
DROP POLICY IF EXISTS "Admins can manage user relationships" ON user_tenants;
DROP POLICY IF EXISTS "Users can create tenant relationships" ON user_tenants;

CREATE POLICY "Users create own relationships"
  ON user_tenants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view own relationships"
  ON user_tenants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage relationships"
  ON user_tenants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = user_tenants.tenant_id
      AND ut.role IN ('owner', 'admin')
    )
  );

-- ACCOUNTS table policies
DROP POLICY IF EXISTS "Users can view accounts" ON accounts;
DROP POLICY IF EXISTS "Editors can create accounts" ON accounts;
DROP POLICY IF EXISTS "Editors can update accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can delete accounts" ON accounts;
DROP POLICY IF EXISTS "Users can create accounts in their tenants" ON accounts;

CREATE POLICY "Users create accounts in own tenants"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND tenant_id = accounts.tenant_id
    )
  );

CREATE POLICY "Users view accounts in own tenants"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND tenant_id = accounts.tenant_id
    )
  );

CREATE POLICY "Users update accounts in own tenants"
  ON accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND tenant_id = accounts.tenant_id
    )
  );

CREATE POLICY "Admins delete accounts"
  ON accounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND tenant_id = accounts.tenant_id
      AND role IN ('owner', 'admin')
    )
  );

-- CATEGORIES table policies
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Editors can create categories" ON categories;
DROP POLICY IF EXISTS "Editors can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Users can create categories in their tenants" ON categories;

CREATE POLICY "Users create categories in own tenants"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND tenant_id = categories.tenant_id
    )
  );

CREATE POLICY "Users view categories in own tenants"
  ON categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND tenant_id = categories.tenant_id
    )
  );

CREATE POLICY "Users update categories in own tenants"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND tenant_id = categories.tenant_id
    )
  );

CREATE POLICY "Admins delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND tenant_id = categories.tenant_id
      AND role IN ('owner', 'admin')
    )
  );
