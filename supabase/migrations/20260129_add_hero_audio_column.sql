-- Add hero_video_audio_enabled column if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS hero_video_audio_enabled BOOLEAN DEFAULT false;

-- Just in case, ensure cinema_video_audio_enabled is also there
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cinema_video_audio_enabled BOOLEAN DEFAULT false;
