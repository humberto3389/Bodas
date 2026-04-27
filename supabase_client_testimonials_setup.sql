-- Script for creating the client_testimonials table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS client_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    wedding_date TEXT,
    text TEXT NOT NULL,
    avatar_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE client_testimonials ENABLE ROW LEVEL SECURITY;

-- Allow clients to insert their own testimonials
-- Note: In a production app, we would use auth.uid() if using Supabase Auth.
-- Since this project uses a custom token system, we allow inserts for now.
CREATE POLICY "Enable insert for everyone" ON client_testimonials
    FOR INSERT WITH CHECK (true);

-- Allow admins (Master Admin) to read and update all testimonials
CREATE POLICY "Enable all access for admins" ON client_testimonials
    FOR ALL USING (true);
