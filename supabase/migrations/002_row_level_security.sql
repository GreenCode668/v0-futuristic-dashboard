-- Row Level Security (RLS) Policies
-- Ensures multi-tenant data isolation

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's tenant IDs
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS SETOF UUID AS $$
  SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user has access to tenant
CREATE OR REPLACE FUNCTION has_tenant_access(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_tenants
    WHERE user_id = auth.uid() AND tenant_id = tenant_uuid
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user has specific role in tenant
CREATE OR REPLACE FUNCTION has_tenant_role(tenant_uuid UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_tenants
    WHERE user_id = auth.uid()
      AND tenant_id = tenant_uuid
      AND role = required_role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user has admin or owner role
CREATE OR REPLACE FUNCTION is_tenant_admin(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_tenants
    WHERE user_id = auth.uid()
      AND tenant_id = tenant_uuid
      AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- TENANTS TABLE POLICIES
-- ============================================================================

-- Users can view tenants they belong to
CREATE POLICY "Users can view their tenants"
  ON tenants FOR SELECT
  USING (id IN (SELECT get_user_tenant_ids()));

-- Only owners can update tenant settings
CREATE POLICY "Owners can update tenants"
  ON tenants FOR UPDATE
  USING (is_tenant_admin(id));

-- ============================================================================
-- USER_TENANTS TABLE POLICIES
-- ============================================================================

-- Users can view their own tenant relationships
CREATE POLICY "Users can view own tenant relationships"
  ON user_tenants FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage user-tenant relationships
CREATE POLICY "Admins can manage user relationships"
  ON user_tenants FOR ALL
  USING (is_tenant_admin(tenant_id));

-- ============================================================================
-- CATEGORIES TABLE POLICIES
-- ============================================================================

-- Users can view categories in their tenants
CREATE POLICY "Users can view categories"
  ON categories FOR SELECT
  USING (has_tenant_access(tenant_id));

-- Editors and above can create categories
CREATE POLICY "Editors can create categories"
  ON categories FOR INSERT
  WITH CHECK (has_tenant_access(tenant_id));

-- Editors and above can update categories
CREATE POLICY "Editors can update categories"
  ON categories FOR UPDATE
  USING (has_tenant_access(tenant_id));

-- Admins can delete categories
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_tenant_admin(tenant_id));

-- ============================================================================
-- ACCOUNTS TABLE POLICIES
-- ============================================================================

-- Users can view accounts in their tenants
CREATE POLICY "Users can view accounts"
  ON accounts FOR SELECT
  USING (has_tenant_access(tenant_id));

-- Editors and above can create accounts
CREATE POLICY "Editors can create accounts"
  ON accounts FOR INSERT
  WITH CHECK (has_tenant_access(tenant_id));

-- Editors and above can update accounts
CREATE POLICY "Editors can update accounts"
  ON accounts FOR UPDATE
  USING (has_tenant_access(tenant_id));

-- Admins can delete accounts
CREATE POLICY "Admins can delete accounts"
  ON accounts FOR DELETE
  USING (is_tenant_admin(tenant_id));

-- ============================================================================
-- CONTACTS TABLE POLICIES
-- ============================================================================

-- Users can view contacts in their tenants
CREATE POLICY "Users can view contacts"
  ON contacts FOR SELECT
  USING (has_tenant_access(tenant_id));

-- Editors and above can manage contacts
CREATE POLICY "Editors can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (has_tenant_access(tenant_id));

CREATE POLICY "Editors can update contacts"
  ON contacts FOR UPDATE
  USING (has_tenant_access(tenant_id));

CREATE POLICY "Admins can delete contacts"
  ON contacts FOR DELETE
  USING (is_tenant_admin(tenant_id));

-- ============================================================================
-- PROJECTS TABLE POLICIES
-- ============================================================================

-- Users can view projects in their tenants
CREATE POLICY "Users can view projects"
  ON projects FOR SELECT
  USING (has_tenant_access(tenant_id));

-- Editors and above can manage projects
CREATE POLICY "Editors can create projects"
  ON projects FOR INSERT
  WITH CHECK (has_tenant_access(tenant_id));

CREATE POLICY "Editors can update projects"
  ON projects FOR UPDATE
  USING (has_tenant_access(tenant_id));

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (is_tenant_admin(tenant_id));

-- ============================================================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Users can view transactions in their tenants
CREATE POLICY "Users can view transactions"
  ON transactions FOR SELECT
  USING (has_tenant_access(tenant_id));

-- Editors and above can create transactions
CREATE POLICY "Editors can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (has_tenant_access(tenant_id));

-- Editors and above can update transactions
CREATE POLICY "Editors can update transactions"
  ON transactions FOR UPDATE
  USING (has_tenant_access(tenant_id));

-- Editors and above can delete transactions
CREATE POLICY "Editors can delete transactions"
  ON transactions FOR DELETE
  USING (has_tenant_access(tenant_id));

-- ============================================================================
-- ATTACHMENTS TABLE POLICIES
-- ============================================================================

-- Users can view attachments in their tenants
CREATE POLICY "Users can view attachments"
  ON attachments FOR SELECT
  USING (has_tenant_access(tenant_id));

-- Editors and above can manage attachments
CREATE POLICY "Editors can upload attachments"
  ON attachments FOR INSERT
  WITH CHECK (has_tenant_access(tenant_id));

CREATE POLICY "Editors can delete attachments"
  ON attachments FOR DELETE
  USING (has_tenant_access(tenant_id));

-- ============================================================================
-- BUDGETS TABLE POLICIES
-- ============================================================================

-- Users can view budgets in their tenants
CREATE POLICY "Users can view budgets"
  ON budgets FOR SELECT
  USING (has_tenant_access(tenant_id));

-- Editors and above can manage budgets
CREATE POLICY "Editors can create budgets"
  ON budgets FOR INSERT
  WITH CHECK (has_tenant_access(tenant_id));

CREATE POLICY "Editors can update budgets"
  ON budgets FOR UPDATE
  USING (has_tenant_access(tenant_id));

CREATE POLICY "Admins can delete budgets"
  ON budgets FOR DELETE
  USING (is_tenant_admin(tenant_id));

-- ============================================================================
-- RECURRING_TEMPLATES TABLE POLICIES
-- ============================================================================

-- Users can view recurring templates in their tenants
CREATE POLICY "Users can view recurring templates"
  ON recurring_templates FOR SELECT
  USING (has_tenant_access(tenant_id));

-- Editors and above can manage recurring templates
CREATE POLICY "Editors can create recurring templates"
  ON recurring_templates FOR INSERT
  WITH CHECK (has_tenant_access(tenant_id));

CREATE POLICY "Editors can update recurring templates"
  ON recurring_templates FOR UPDATE
  USING (has_tenant_access(tenant_id));

CREATE POLICY "Editors can delete recurring templates"
  ON recurring_templates FOR DELETE
  USING (has_tenant_access(tenant_id));

-- ============================================================================
-- AUDIT_LOGS TABLE POLICIES
-- ============================================================================

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_tenant_admin(tenant_id));

-- System can insert audit logs (no user policy needed, done via triggers)
