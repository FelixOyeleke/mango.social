-- Migration: Add image storage to database
-- This migration adds columns to store images directly in the database

-- Add image storage to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_data BYTEA,
ADD COLUMN IF NOT EXISTS avatar_mime_type VARCHAR(50);

-- Add image storage to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS featured_image_data BYTEA,
ADD COLUMN IF NOT EXISTS featured_image_mime_type VARCHAR(50);

-- Create images table for general image storage
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    size INTEGER NOT NULL,
    data BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster image retrieval
CREATE INDEX IF NOT EXISTS idx_images_user ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_filename ON images(filename);

