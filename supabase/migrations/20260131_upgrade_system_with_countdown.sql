-- Migration: Upgrade System with 24h Countdown
-- Date: 2026-01-31
-- Description: Add fields for upgrade approval with 24h countdown system

-- Add new columns to clients table (idempotent - safe to run multiple times)
DO $$ 
BEGIN
    -- upgrade_approved_at: Fecha en que el admin aprobó el upgrade
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND column_name = 'upgrade_approved_at'
    ) THEN
        ALTER TABLE clients ADD COLUMN upgrade_approved_at TIMESTAMPTZ;
    END IF;

    -- upgrade_confirmed: Si el pago fue confirmado por el admin
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND column_name = 'upgrade_confirmed'
    ) THEN
        ALTER TABLE clients ADD COLUMN upgrade_confirmed BOOLEAN DEFAULT false;
    END IF;

    -- original_plan_type: Plan original antes del upgrade aprobado
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND column_name = 'original_plan_type'
    ) THEN
        ALTER TABLE clients ADD COLUMN original_plan_type TEXT CHECK (original_plan_type IN ('basic', 'premium', 'deluxe'));
    END IF;
END $$;

-- Actualizar constraint de plan_status para incluir 'upgrade_approved'
DO $$
BEGIN
    -- Buscar y eliminar constraint existente de plan_status
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND constraint_name = 'clients_plan_status_check'
    ) THEN
        ALTER TABLE clients DROP CONSTRAINT clients_plan_status_check;
    END IF;
    
    -- Agregar nuevo constraint con 'upgrade_approved'
    ALTER TABLE clients ADD CONSTRAINT clients_plan_status_check 
        CHECK (plan_status IN ('active', 'pending_upgrade', 'expired', 'upgrade_approved'));
EXCEPTION
    WHEN duplicate_object THEN
        -- Si el constraint ya existe, no hacer nada
        NULL;
END $$;

-- Add indexes for better query performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_clients_upgrade_approved_at 
    ON clients(upgrade_approved_at) 
    WHERE upgrade_approved_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clients_upgrade_confirmed 
    ON clients(upgrade_confirmed) 
    WHERE upgrade_confirmed = false;

-- Add comments for documentation
COMMENT ON COLUMN clients.upgrade_approved_at IS 'Fecha en que el admin master aprobó el upgrade. Inicia cuenta regresiva de 24h';
COMMENT ON COLUMN clients.upgrade_confirmed IS 'Si el pago fue confirmado por el admin. Cuando es true, el upgrade se hace permanente';
COMMENT ON COLUMN clients.original_plan_type IS 'Plan original del cliente antes del upgrade aprobado. Se usa para revertir si no se confirma en 24h';
