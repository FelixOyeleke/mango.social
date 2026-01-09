import { pool } from '../connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function addRepostsAndCommunities() {
  try {
    console.log('🔄 Adding reposts and communities features...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');


    // Add repost columns to stories table
    await pool.query(`
      ALTER TABLE stories
      ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS original_story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS repost_comment TEXT,
      ADD COLUMN IF NOT EXISTS reposts_count INTEGER DEFAULT 0;
    `);
    console.log('✅ Added repost columns to stories table');

    // Create reposts tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reposts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
        repost_story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, story_id)
      );
    `);
    console.log('✅ Created reposts table');

    // Create communities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS communities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        banner_image_url TEXT,
        icon_url TEXT,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        member_count INTEGER DEFAULT 0,
        post_count INTEGER DEFAULT 0,
        is_private BOOLEAN DEFAULT false,
        rules TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created communities table');

    // Create community_members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(community_id, user_id)
      );
    `);
    console.log('✅ Created community_members table');

    // Add community_id to stories
    await pool.query(`
      ALTER TABLE stories
      ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE SET NULL;
    `);
    console.log('✅ Added community_id to stories table');

    // Add bio and other profile fields to users
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS website VARCHAR(500),
      ADD COLUMN IF NOT EXISTS banner_url TEXT,
      ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(100),
      ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS visa_status VARCHAR(100),
      ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100);
    `);
    console.log('✅ Added profile fields to users table');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts(user_id);
      CREATE INDEX IF NOT EXISTS idx_reposts_story ON reposts(story_id);
      CREATE INDEX IF NOT EXISTS idx_stories_community ON stories(community_id);
      CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
      CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
    `);
    console.log('✅ Created indexes');

    // Create function to update reposts count
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_reposts_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE stories 
          SET reposts_count = reposts_count + 1 
          WHERE id = NEW.story_id;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE stories 
          SET reposts_count = reposts_count - 1 
          WHERE id = OLD.story_id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_reposts_count ON reposts;
      CREATE TRIGGER trigger_update_reposts_count
      AFTER INSERT OR DELETE ON reposts
      FOR EACH ROW
      EXECUTE FUNCTION update_reposts_count();
    `);
    console.log('✅ Created repost count triggers');

    // Create function to update community member count
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_community_member_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE communities 
          SET member_count = member_count + 1 
          WHERE id = NEW.community_id;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE communities 
          SET member_count = member_count - 1 
          WHERE id = OLD.community_id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_community_member_count ON community_members;
      CREATE TRIGGER trigger_update_community_member_count
      AFTER INSERT OR DELETE ON community_members
      FOR EACH ROW
      EXECUTE FUNCTION update_community_member_count();
    `);
    console.log('✅ Created community member count triggers');

    console.log('\n✅ Successfully added reposts and communities features!');
    console.log('\nNew features:');
    console.log('  - Repost stories with optional comments');
    console.log('  - Create and join communities');
    console.log('  - Enhanced user profiles with bio, location, etc.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding features:', error);
    process.exit(1);
  }
}

addRepostsAndCommunities();

