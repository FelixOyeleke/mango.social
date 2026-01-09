-- Create user app preferences table
-- This allows users to enable/disable different apps (Dating, Jobs, Forum, etc.)

-- Create apps table to define available apps
CREATE TABLE IF NOT EXISTS apps (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50),
    is_core BOOLEAN DEFAULT false, -- Core apps can't be disabled (e.g., Profile, Settings)
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_app_preferences table
CREATE TABLE IF NOT EXISTS user_app_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id VARCHAR(50) REFERENCES apps(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, app_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_app_preferences_user_id ON user_app_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_preferences_app_id ON user_app_preferences(app_id);
CREATE INDEX IF NOT EXISTS idx_user_app_preferences_enabled ON user_app_preferences(user_id, is_enabled);

-- Insert default apps
INSERT INTO apps (id, name, description, icon, category, is_core, is_active, sort_order) VALUES
    ('forum', 'Forum', 'Share your immigration stories and experiences', 'MessageSquare', 'social', true, true, 1),
    ('dating', 'Dating', 'Connect with other immigrants for dating and relationships', 'Heart', 'social', false, true, 2),
    ('jobs', 'Jobs', 'Find immigration-friendly job opportunities', 'Briefcase', 'professional', false, true, 3),
    ('communities', 'Communities', 'Join communities based on your interests and background', 'Users', 'social', false, true, 4),
    ('messaging', 'Messaging', 'Direct messages and group chats', 'MessageCircle', 'communication', true, true, 5),
    ('events', 'Events', 'Discover local events and meetups', 'Calendar', 'social', false, true, 6),
    ('resources', 'Resources', 'Immigration guides, visa information, and helpful resources', 'BookOpen', 'information', false, true, 7),
    ('marketplace', 'Marketplace', 'Buy and sell items within the immigrant community', 'ShoppingBag', 'commerce', false, true, 8)
ON CONFLICT (id) DO NOTHING;

-- Function to initialize app preferences for new users
CREATE OR REPLACE FUNCTION initialize_user_app_preferences()
RETURNS TRIGGER AS $$
BEGIN
    -- Enable all core apps by default for new users
    INSERT INTO user_app_preferences (user_id, app_id, is_enabled)
    SELECT NEW.id, id, true
    FROM apps
    WHERE is_core = true
    ON CONFLICT (user_id, app_id) DO NOTHING;
    
    -- Enable forum, jobs, and communities by default (common use cases)
    INSERT INTO user_app_preferences (user_id, app_id, is_enabled)
    SELECT NEW.id, id, true
    FROM apps
    WHERE id IN ('forum', 'jobs', 'communities')
    ON CONFLICT (user_id, app_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize preferences for new users
DROP TRIGGER IF EXISTS trigger_initialize_user_app_preferences ON users;
CREATE TRIGGER trigger_initialize_user_app_preferences
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_app_preferences();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_user_app_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_app_preferences_updated_at ON user_app_preferences;
CREATE TRIGGER trigger_update_user_app_preferences_updated_at
    BEFORE UPDATE ON user_app_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_app_preferences_updated_at();

-- Initialize preferences for existing users
INSERT INTO user_app_preferences (user_id, app_id, is_enabled)
SELECT u.id, a.id, true
FROM users u
CROSS JOIN apps a
WHERE a.is_core = true OR a.id IN ('forum', 'jobs', 'communities')
ON CONFLICT (user_id, app_id) DO NOTHING;

-- Add comments
COMMENT ON TABLE apps IS 'Available apps in the platform';
COMMENT ON TABLE user_app_preferences IS 'User preferences for which apps to enable/disable';
COMMENT ON COLUMN apps.is_core IS 'Core apps cannot be disabled by users';
COMMENT ON COLUMN user_app_preferences.is_enabled IS 'Whether the user has enabled this app';

