-- Disable RLS for webhooks tables
-- Safe because API routes already check permissions

ALTER TABLE webhooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (cleanup)
DROP POLICY IF EXISTS "Users can view webhooks in their organization" ON webhooks;
DROP POLICY IF EXISTS "Admins can create webhooks" ON webhooks;
DROP POLICY IF EXISTS "Organization members can create webhooks" ON webhooks;
DROP POLICY IF EXISTS "Admins can update webhooks" ON webhooks;
DROP POLICY IF EXISTS "Organization members can update webhooks" ON webhooks;
DROP POLICY IF EXISTS "Admins can delete webhooks" ON webhooks;
DROP POLICY IF EXISTS "Organization members can delete webhooks" ON webhooks;
DROP POLICY IF EXISTS "Users can view webhook logs in their organization" ON webhook_logs;
