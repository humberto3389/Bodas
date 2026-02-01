-- Migration: Fix Clients RLS for Master Admin
-- Date: 2026-01-30
-- Description: Allow Master Admin to INSERT, UPDATE, DELETE clients.

-- Enable RLS on clients (ensure it is on)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy to allow Master Admin to INSERT new clients
-- We check for the specific email OR the master_admin role
DROP POLICY IF EXISTS "Master Admin insert clients" ON public.clients;
CREATE POLICY "Master Admin insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' = 'mhuallpasullca@gmail.com'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'master_admin'
);

-- Policy to allow Master Admin to UPDATE clients
DROP POLICY IF EXISTS "Master Admin update clients" ON public.clients;
CREATE POLICY "Master Admin update clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'mhuallpasullca@gmail.com'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'master_admin'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'mhuallpasullca@gmail.com'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'master_admin'
);

-- Policy to allow Master Admin to DELETE clients
DROP POLICY IF EXISTS "Master Admin delete clients" ON public.clients;
CREATE POLICY "Master Admin delete clients"
ON public.clients
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'mhuallpasullca@gmail.com'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'master_admin'
);

-- Policy to allow Master Admin to SELECT clients (if not covered by public policy)
DROP POLICY IF EXISTS "Master Admin select clients" ON public.clients;
CREATE POLICY "Master Admin select clients"
ON public.clients
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'mhuallpasullca@gmail.com'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'master_admin'
);
