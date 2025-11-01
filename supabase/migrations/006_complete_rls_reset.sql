-- Complete RLS reset and simplified policies for onboarding
-- This will remove all policies and create fresh ones

-- DISABLE RLS temporarily to clean up
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on these tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename IN ('tenants', 'users', 'user_tenants', 'accounts', 'categories')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TENANTS - Simple policies
-- ============================================================================

-- Anyone can create a tenant
CREATE POLICY "tenant_insert_policy"
  ON tenants FOR INSERT
  WITH CHECK (true);

-- Users can only see tenants they belong to
CREATE POLICY "tenant_select_policy"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
    )
  );

-- Users can update tenants they own/admin
CREATE POLICY "tenant_update_policy"
  ON tenants FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- USERS - Simple policies
-- ============================================================================

CREATE POLICY "user_insert_policy"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "user_select_policy"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "user_update_policy"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- ============================================================================
-- USER_TENANTS - Non-recursive policies
-- ============================================================================

CREATE POLICY "user_tenant_insert_policy"
  ON user_tenants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_tenant_select_policy"
  ON user_tenants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_tenant_update_policy"
  ON user_tenants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "user_tenant_delete_policy"
  ON user_tenants FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- ACCOUNTS - Simple policies
-- ============================================================================

CREATE POLICY "account_insert_policy"
  ON accounts FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "account_select_policy"
  ON accounts FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "account_update_policy"
  ON accounts FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "account_delete_policy"
  ON accounts FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- CATEGORIES - Simple policies
-- ============================================================================

CREATE POLICY "category_insert_policy"
  ON categories FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "category_select_policy"
  ON categories FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "category_update_policy"
  ON categories FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "category_delete_policy"
  ON categories FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Verify the policies were created
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('tenants', 'users', 'user_tenants', 'accounts', 'categories')
ORDER BY tablename, cmd, policyname;
