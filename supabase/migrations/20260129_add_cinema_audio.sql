-- Add cinema_video_audio_enabled column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS cinema_video_audio_enabled BOOLEAN DEFAULT false;

-- Comment on column
COMMENT ON COLUMN clients.cinema_video_audio_enabled IS 'Controls if audio is enabled for the Cinema/Multimedia video section';
