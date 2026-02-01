-- Migration: Fix Wedding Timezones
-- Date: 2026-01-31
-- Description: Add timezone column and correct wedding_datetime_utc based on wedding_time (source of truth).

BEGIN;

-- 1. Añadir columna timezone con valor por defecto
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'timezone') THEN
        ALTER TABLE clients ADD COLUMN timezone TEXT DEFAULT 'America/Lima';
    END IF;
END $$;

-- 2. Corregir datos existentes
-- Usamos la fecha de wedding_date y la hora de wedding_time (fuente de verdad)
-- AT TIME ZONE 'America/Lima' convierte de la zona local indicada a UTC para el tipo TIMESTAMPTZ
UPDATE clients 
SET wedding_datetime_utc = (wedding_date::date + wedding_time::time) AT TIME ZONE 'America/Lima'
WHERE wedding_time IS NOT NULL 
  AND wedding_time ~ '^([01]?[0-9]|2[0-3]):[0-5][0-9]$';

-- 3. Caso especial: si wedding_time tenía AM/PM (limpieza preventiva)
UPDATE clients
SET wedding_datetime_utc = (wedding_date::date + (regexp_replace(wedding_time, '\s*(AM|PM)\s*', '', 'i'))::time + 
    CASE WHEN wedding_time ILIKE '%PM%' AND split_part(wedding_time, ':', 1)::int < 12 THEN INTERVAL '12 hours'
         WHEN wedding_time ILIKE '%AM%' AND split_part(wedding_time, ':', 1)::int = 12 THEN INTERVAL '-12 hours'
         ELSE INTERVAL '0 hours' END) AT TIME ZONE 'America/Lima'
WHERE wedding_time IS NOT NULL 
  AND wedding_time ILIKE ANY (ARRAY['%AM%', '%PM%']);

COMMIT;

-- ROLLBACK Instructions:
-- BEGIN;
-- ALTER TABLE clients DROP COLUMN IF EXISTS timezone;
-- -- Nota: wedding_datetime_utc no se puede revertir sin backup pero el script actual se considera correctivo.
-- ROLLBACK;
