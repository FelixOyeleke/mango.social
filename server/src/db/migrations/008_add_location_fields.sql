-- Add city and country fields to users table for location tracking
-- This allows us to show user location in posts

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);

-- Add comments
COMMENT ON COLUMN users.city IS 'User''s current city';
COMMENT ON COLUMN users.country IS 'User''s current country';
COMMENT ON COLUMN users.country_code IS 'ISO country code (e.g., US, CA, GB)';
COMMENT ON COLUMN users.latitude IS 'GPS latitude for location-based features';
COMMENT ON COLUMN users.longitude IS 'GPS longitude for location-based features';

