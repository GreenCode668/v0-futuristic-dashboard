-- Fix infinite recursion in user_tenants policies
-- The issue: "Admins manage relationships" policy was querying user_tenants within a policy on user_tenants

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins manage relationships" ON user_tenants;

-- Replace with simpler policies that don't cause recursion
-- Allow users to update/delete their own relationships
CREATE POLICY "Users manage own relationships"
  ON user_tenants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users delete own relationships"
  ON user_tenants FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- For now, we'll handle admin-level user management through the application layer
-- Later we can add a separate admin table or use Supabase's built-in roles
