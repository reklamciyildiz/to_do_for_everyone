-- Make organization_id nullable in users table
-- This allows users to be removed from organizations while keeping their accounts

ALTER TABLE users 
ALTER COLUMN organization_id DROP NOT NULL;

-- Add comment to explain the change
COMMENT ON COLUMN users.organization_id IS 'Organization ID - nullable when user is removed from organization';
