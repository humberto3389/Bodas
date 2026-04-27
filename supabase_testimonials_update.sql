-- Script to add 'rating' and 'is_fake' to client_testimonials
-- Run this in Supabase SQL Editor

ALTER TABLE client_testimonials
ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS is_fake BOOLEAN DEFAULT false;

-- If you want existing testimonials to have a default rating of 5:
UPDATE client_testimonials SET rating = 5 WHERE rating IS NULL;
UPDATE client_testimonials SET is_fake = false WHERE is_fake IS NULL;
