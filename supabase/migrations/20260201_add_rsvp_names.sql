-- SQL para agregar campos de nombres de invitados y estado de asistencia
-- Ejecuta este SQL en el Editor SQL de tu panel de Supabase

ALTER TABLE rsvps 
ADD COLUMN IF NOT EXISTS is_attending BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS attending_names TEXT,
ADD COLUMN IF NOT EXISTS not_attending_names TEXT;

-- Comentario informativo
COMMENT ON COLUMN rsvps.is_attending IS 'Indica si el invitado principal asistirá';
COMMENT ON COLUMN rsvps.attending_names IS 'Lista de nombres de los familiares/acompañantes que asistirán';
COMMENT ON COLUMN rsvps.not_attending_names IS 'Lista de nombres de las personas que NO podrán asistir';
