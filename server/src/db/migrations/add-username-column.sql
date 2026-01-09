-- Add username column to users table
-- This migration adds a unique username field for @mentions

-- Add username column (nullable initially)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Generate usernames for existing users (from email)
-- This creates unique usernames from email addresses
DO $$
DECLARE
    user_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    FOR user_record IN SELECT id, email FROM users WHERE username IS NULL
    LOOP
        -- Extract username from email (part before @)
        base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(user_record.email, '@', 1), '[^a-z0-9_]', '', 'g'));
        
        -- Ensure username is not empty
        IF base_username = '' THEN
            base_username := 'user';
        END IF;
        
        -- Make username unique by adding numbers if needed
        final_username := base_username;
        counter := 1;
        
        WHILE EXISTS (SELECT 1 FROM users WHERE username = final_username) LOOP
            final_username := base_username || counter;
            counter := counter + 1;
        END LOOP;
        
        -- Update user with generated username
        UPDATE users SET username = final_username WHERE id = user_record.id;
    END LOOP;
END $$;

-- Now make username NOT NULL since all users have one
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Add comment
COMMENT ON COLUMN users.username IS 'Unique username for @mentions and user identification';

