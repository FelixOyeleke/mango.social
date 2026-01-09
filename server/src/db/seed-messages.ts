import { pool } from './connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedMessages() {
  try {
    console.log('🔄 Seeding messaging data...');

    // Get some users
    const usersResult = await pool.query(`
      SELECT id, full_name FROM users LIMIT 5
    `);

    if (usersResult.rows.length < 2) {
      console.log('⚠️  Need at least 2 users to seed messages. Please create users first.');
      process.exit(0);
    }

    const users = usersResult.rows;
    console.log(`✅ Found ${users.length} users`);

    // Create conversations between users
    const conversations = [];

    // Conversation 1: User 0 and User 1
    if (users.length >= 2) {
      const conv1 = await pool.query(`
        INSERT INTO conversations (created_by, is_group)
        VALUES ($1, false)
        RETURNING id
      `, [users[0].id]);

      await pool.query(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2), ($1, $3)
      `, [conv1.rows[0].id, users[0].id, users[1].id]);

      // Add some messages
      await pool.query(`
        INSERT INTO messages (conversation_id, sender_id, content, created_at)
        VALUES 
          ($1, $2, 'Hey! How are you doing?', NOW() - INTERVAL '2 hours'),
          ($1, $3, 'I''m doing great! Just finished my visa interview.', NOW() - INTERVAL '1 hour 50 minutes'),
          ($1, $2, 'That''s awesome! How did it go?', NOW() - INTERVAL '1 hour 45 minutes'),
          ($1, $3, 'It went really well! The officer was very friendly.', NOW() - INTERVAL '1 hour 30 minutes'),
          ($1, $2, 'Congratulations! When do you expect to hear back?', NOW() - INTERVAL '1 hour')
      `, [conv1.rows[0].id, users[0].id, users[1].id]);

      conversations.push(conv1.rows[0].id);
      console.log(`✅ Created conversation between ${users[0].full_name} and ${users[1].full_name}`);
    }

    // Conversation 2: User 0 and User 2
    if (users.length >= 3) {
      const conv2 = await pool.query(`
        INSERT INTO conversations (created_by, is_group)
        VALUES ($1, false)
        RETURNING id
      `, [users[0].id]);

      await pool.query(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2), ($1, $3)
      `, [conv2.rows[0].id, users[0].id, users[2].id]);

      await pool.query(`
        INSERT INTO messages (conversation_id, sender_id, content, created_at)
        VALUES 
          ($1, $2, 'Hi! I saw your post about H1B sponsorship.', NOW() - INTERVAL '3 hours'),
          ($1, $3, 'Yes! I''d be happy to share my experience.', NOW() - INTERVAL '2 hours 45 minutes'),
          ($1, $2, 'That would be great! What was the timeline like?', NOW() - INTERVAL '2 hours 30 minutes')
      `, [conv2.rows[0].id, users[2].id, users[0].id]);

      conversations.push(conv2.rows[0].id);
      console.log(`✅ Created conversation between ${users[0].full_name} and ${users[2].full_name}`);
    }

    // Conversation 3: User 1 and User 2
    if (users.length >= 3) {
      const conv3 = await pool.query(`
        INSERT INTO conversations (created_by, is_group)
        VALUES ($1, false)
        RETURNING id
      `, [users[1].id]);

      await pool.query(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2), ($1, $3)
      `, [conv3.rows[0].id, users[1].id, users[2].id]);

      await pool.query(`
        INSERT INTO messages (conversation_id, sender_id, content, created_at)
        VALUES 
          ($1, $2, 'Thanks for connecting!', NOW() - INTERVAL '5 hours'),
          ($1, $3, 'You''re welcome! Let me know if you need any help.', NOW() - INTERVAL '4 hours 30 minutes')
      `, [conv3.rows[0].id, users[1].id, users[2].id]);

      conversations.push(conv3.rows[0].id);
      console.log(`✅ Created conversation between ${users[1].full_name} and ${users[2].full_name}`);
    }

    // Create a group conversation if we have enough users
    if (users.length >= 4) {
      const groupConv = await pool.query(`
        INSERT INTO conversations (created_by, is_group, title)
        VALUES ($1, true, 'H1B Support Group')
        RETURNING id
      `, [users[0].id]);

      await pool.query(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2), ($1, $3), ($1, $4)
      `, [groupConv.rows[0].id, users[0].id, users[1].id, users[2].id]);

      await pool.query(`
        INSERT INTO messages (conversation_id, sender_id, content, created_at)
        VALUES 
          ($1, $2, 'Welcome everyone to the H1B support group!', NOW() - INTERVAL '1 day'),
          ($1, $3, 'Thanks for creating this! Looking forward to sharing experiences.', NOW() - INTERVAL '23 hours'),
          ($1, $4, 'This is great! Happy to help anyone with questions.', NOW() - INTERVAL '22 hours')
      `, [groupConv.rows[0].id, users[0].id, users[1].id, users[2].id]);

      conversations.push(groupConv.rows[0].id);
      console.log(`✅ Created group conversation: H1B Support Group`);
    }

    console.log(`\n✅ Successfully seeded ${conversations.length} conversations!`);
    console.log('\nYou can now test the messaging feature by logging in as any of these users.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding messages:', error);
    process.exit(1);
  }
}

seedMessages();

