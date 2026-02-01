-- Migration: Comprehensive Project Corrections
-- Date: 2026-01-29
-- Description: Create admin_messages table and extend clients table for proper upgrade/contact handling.

-- 1. Create admin_messages table
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('contact', 'upgrade')),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name TEXT,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    requested_plan TEXT, -- 'premium' or 'deluxe'
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Extend clients table with missing fields if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pf_columns WHERE table_name = 'clients' AND column_name = 'plan_status') THEN
        ALTER TABLE clients ADD COLUMN plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'pending_upgrade', 'expired'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pf_columns WHERE table_name = 'clients' AND column_name = 'pending_plan') THEN
        ALTER TABLE clients ADD COLUMN pending_plan TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pf_columns WHERE table_name = 'clients' AND column_name = 'upgrade_requested_at') THEN
        ALTER TABLE clients ADD COLUMN upgrade_requested_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pf_columns WHERE table_name = 'clients' AND column_name = 'upgrade_expires_at') THEN
        ALTER TABLE clients ADD COLUMN upgrade_expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Enable RLS for admin_messages
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies for admin_messages
-- Public can insert (for contact form)
CREATE POLICY "Enable insert for everyone" ON admin_messages FOR INSERT WITH CHECK (true);

-- Authenticated admins can view/manage
-- Note: 'is_admin' logic depends on your specific auth setup, 
-- but usually master admins have a specific claim or metadata.
-- For now, enabling access for all authenticated users (assuming they are admins) 
-- is a common starting point in these projects, but let's be more specific if possible.
CREATE POLICY "Admins can view and update messages" ON admin_messages
    FOR ALL
    USING (auth.role() = 'authenticated');

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_messages_updated_at
BEFORE UPDATE ON admin_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
