import { pool } from '../connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function createMessagingTables() {
  try {
    console.log('🔄 Creating messaging tables...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');


    // Create conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255),
        is_group BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created conversations table');

    // Create conversation_participants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_muted BOOLEAN DEFAULT false,
        UNIQUE(conversation_id, user_id)
      );
    `);
    console.log('✅ Created conversation_participants table');

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        attachment_url TEXT,
        is_read BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created messages table');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation 
      ON messages(conversation_id, created_at DESC);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender 
      ON messages(sender_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
      ON conversation_participants(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation 
      ON conversation_participants(conversation_id);
    `);

    console.log('✅ Created indexes');

    // Create function to update conversation updated_at on new message
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_conversation_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE conversations 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.conversation_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
      CREATE TRIGGER trigger_update_conversation_timestamp
      AFTER INSERT ON messages
      FOR EACH ROW
      EXECUTE FUNCTION update_conversation_timestamp();
    `);

    console.log('✅ Created triggers');

    console.log('\n✅ Messaging tables created successfully!');
    console.log('\nTables created:');
    console.log('  - conversations');
    console.log('  - conversation_participants');
    console.log('  - messages');
    console.log('\nIndexes and triggers created for optimal performance.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating messaging tables:', error);
    process.exit(1);
  }
}

createMessagingTables();

