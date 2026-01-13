-- =============================================
-- ENABLE RLS FOR ALL TABLES
-- Migration Date: 2026-01-14
-- Purpose: Enable Row Level Security for all tables
-- Safe: API routes use service role key (bypasses RLS)
-- =============================================

-- =============================================
-- USERS TABLE
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (id = auth.uid());

COMMENT ON POLICY "Users can view their own data" ON users IS 
  'Users can only see their own user record';

-- =============================================
-- ORGANIZATIONS TABLE
-- =============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

COMMENT ON POLICY "Users can view their organization" ON organizations IS 
  'Users can only see their own organization';

-- =============================================
-- TEAMS TABLE
-- =============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their organization"
  ON teams FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view teams in their organization" ON teams IS 
  'Users can see all teams in their organization';

-- =============================================
-- TEAM MEMBERS TABLE
-- =============================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members in their teams"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view team members in their teams" ON team_members IS 
  'Users can see members of teams they belong to';

-- =============================================
-- TASKS TABLE
-- =============================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their teams"
  ON tasks FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view tasks in their teams" ON tasks IS 
  'Users can see tasks in teams they are members of';

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view customers in their organization"
  ON customers FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view customers in their organization" ON customers IS 
  'Users can see all customers in their organization';

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

COMMENT ON POLICY "Users can view their own notifications" ON notifications IS 
  'Users can only see their own notifications';

-- =============================================
-- ACHIEVEMENTS TABLE
-- =============================================
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

COMMENT ON POLICY "Everyone can view achievements" ON achievements IS 
  'All achievements are public';

-- =============================================
-- USER ACHIEVEMENTS TABLE
-- =============================================
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view team members achievements"
  ON user_achievements FOR SELECT
  USING (
    user_id IN (
      SELECT tm.user_id 
      FROM team_members tm
      WHERE tm.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

COMMENT ON POLICY "Users can view their own achievements" ON user_achievements IS 
  'Users can see their own achievement progress';

COMMENT ON POLICY "Users can view team members achievements" ON user_achievements IS 
  'Users can see achievements of their team members';

-- =============================================
-- COMMENTS TABLE (if exists)
-- =============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    
    EXECUTE 'CREATE POLICY "Users can view comments on tasks they can see"
      ON comments FOR SELECT
      USING (
        task_id IN (
          SELECT id FROM tasks WHERE team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
          )
        )
      )';
  END IF;
END $$;

-- =============================================
-- INVITATIONS TABLE
-- =============================================
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations to their organization"
  ON invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view invitations to their organization" ON invitations IS 
  'Users can see invitations for their organization';

-- =============================================
-- WEBHOOKS & WEBHOOK LOGS (Already handled)
-- =============================================
-- These tables already have RLS disabled in previous migration
-- No action needed

-- =============================================
-- VERIFICATION & ROLLBACK
-- =============================================

-- Function to check RLS status
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE (
  table_name text,
  rls_enabled boolean,
  policy_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::text,
    c.relrowsecurity,
    COUNT(p.polname)
  FROM pg_class c
  LEFT JOIN pg_policy p ON p.polrelid = c.oid
  WHERE c.relnamespace = 'public'::regnamespace
    AND c.relkind = 'r'
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql;

-- Check RLS status after migration
-- Run: SELECT * FROM check_rls_status();

-- =============================================
-- ROLLBACK SCRIPT (Emergency Use Only)
-- =============================================
-- If something goes wrong, run this to disable RLS:
/*
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
*/

-- =============================================
-- NOTES
-- =============================================
-- 1. API routes use service role key - they bypass RLS
-- 2. Frontend doesn't directly access Supabase - all through API
-- 3. RLS is a second layer of security (defense in depth)
-- 4. If issues occur, disable RLS immediately using rollback script
-- 5. Monitor logs for 24 hours after enabling

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ RLS enabled successfully for all tables!';
  RAISE NOTICE '📊 Run: SELECT * FROM check_rls_status(); to verify';
  RAISE NOTICE '⚠️  Monitor logs for 24 hours';
  RAISE NOTICE '🔄 Rollback script available in comments if needed';
END $$;
