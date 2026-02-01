-- Migration to add Plans and Upgrade System fields
-- Run this script in Supabase SQL Editor

-- 1. Add new columns for Upgrade System
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS plan_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS pending_plan VARCHAR(20),
ADD COLUMN IF NOT EXISTS pending_since TIMESTAMP WITH TIME ZONE;

-- 2. Add check constraints to ensure data integrity
-- Ensure plan_status is one of the allowed values
ALTER TABLE clients 
ADD CONSTRAINT check_plan_status 
CHECK (plan_status IN ('active', 'pending_upgrade', 'expired'));

-- Ensure pending_plan is a valid plan type or null
ALTER TABLE clients 
ADD CONSTRAINT check_pending_plan 
CHECK (pending_plan IN ('basic', 'premium', 'deluxe') OR pending_plan IS NULL);

-- 3. Add comment for clarity
COMMENT ON COLUMN clients.plan_status IS 'Estado del plan: active, pending_upgrade, expired';
COMMENT ON COLUMN clients.pending_plan IS 'Plan solicitado durante upgrade (premium, deluxe)';
COMMENT ON COLUMN clients.pending_since IS 'Fecha cuando se solicitó el upgrade (para modo estricto 24h)';
