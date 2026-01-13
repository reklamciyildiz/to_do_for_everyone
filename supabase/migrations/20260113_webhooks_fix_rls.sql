-- Fix RLS policies for webhooks - allow all organization members to manage webhooks

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can create webhooks" ON webhooks;
DROP POLICY IF EXISTS "Admins can update webhooks" ON webhooks;
DROP POLICY IF EXISTS "Admins can delete webhooks" ON webhooks;

-- Create new policies - allow all organization members
CREATE POLICY "Organization members can create webhooks"
  ON webhooks FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update webhooks"
  ON webhooks FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization members can delete webhooks"
  ON webhooks FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );
