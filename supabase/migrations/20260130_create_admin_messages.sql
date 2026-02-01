-- Migration to create admin_messages table for contact requests and upgrade requests
-- This table centralizes all messages sent to the master admin panel

CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('contact', 'upgrade')),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT,
    requested_plan VARCHAR(20) CHECK (requested_plan IN ('basic', 'premium', 'deluxe') OR requested_plan IS NULL),
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_messages_type ON admin_messages(type);
CREATE INDEX IF NOT EXISTS idx_admin_messages_status ON admin_messages(status);
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_messages_client_id ON admin_messages(client_id);

-- Add comments for documentation
COMMENT ON TABLE admin_messages IS 'Centralized table for all admin messages including contact requests and upgrade requests';
COMMENT ON COLUMN admin_messages.type IS 'Type of message: contact (from landing page) or upgrade (from client panel)';
COMMENT ON COLUMN admin_messages.client_id IS 'Reference to client if message is from existing client (upgrade requests)';
COMMENT ON COLUMN admin_messages.client_name IS 'Name of the person/client sending the message';
COMMENT ON COLUMN admin_messages.email IS 'Email address of the sender';
COMMENT ON COLUMN admin_messages.subject IS 'Subject or title of the message';
COMMENT ON COLUMN admin_messages.message IS 'Full message content';
COMMENT ON COLUMN admin_messages.requested_plan IS 'Plan requested (for upgrade requests or contact form plan selection)';
COMMENT ON COLUMN admin_messages.status IS 'Status: new, read, approved (for upgrades), rejected (for upgrades)';

-- Enable Row Level Security (RLS)
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow master admins to read all messages
CREATE POLICY "Master admins can view all messages"
    ON admin_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.email = 'mhuallpasullca@gmail.com'
                OR auth.users.raw_app_meta_data->>'role' = 'master_admin'
            )
        )
    );

-- Create policy to allow master admins to update messages
CREATE POLICY "Master admins can update messages"
    ON admin_messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.email = 'mhuallpasullca@gmail.com'
                OR auth.users.raw_app_meta_data->>'role' = 'master_admin'
            )
        )
    );

-- Create policy to allow anyone to insert contact messages (from landing page)
CREATE POLICY "Anyone can insert contact messages"
    ON admin_messages
    FOR INSERT
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_admin_messages_updated_at
    BEFORE UPDATE ON admin_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_messages_updated_at();
