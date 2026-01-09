// Check who has liked stories
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkLikes() {
  const client = await pool.connect();
  
  try {
    console.log('\n📊 Checking likes in database...\n');
    
    // Get all likes with user info
    const likes = await client.query(`
      SELECT l.id, l.story_id, l.user_id, l.created_at,
             u.email, u.full_name,
             s.title as story_title
      FROM likes l
      JOIN users u ON l.user_id = u.id
      JOIN stories s ON l.story_id = s.id
      ORDER BY l.created_at DESC
      LIMIT 50
    `);
    
    console.log(`Total likes: ${likes.rowCount}\n`);
    
    if (likes.rowCount > 0) {
      console.log('Recent likes:');
      likes.rows.forEach((like, index) => {
        console.log(`${index + 1}. ${like.full_name} (${like.email}) liked "${like.story_title.substring(0, 50)}..."`);
      });
    }
    
    // Group by user
    const byUser = await client.query(`
      SELECT u.email, u.full_name, COUNT(*) as like_count
      FROM likes l
      JOIN users u ON l.user_id = u.id
      GROUP BY u.id, u.email, u.full_name
      ORDER BY like_count DESC
    `);
    
    console.log('\n\nLikes by user:');
    byUser.rows.forEach((row) => {
      console.log(`  ${row.full_name} (${row.email}): ${row.like_count} likes`);
    });
    
    // Check for seed users
    const seedUsers = await client.query(`
      SELECT id, email, full_name FROM users 
      WHERE email IN (
        'maria.rodriguez@email.com',
        'ahmed.hassan@email.com',
        'li.wei@email.com',
        'priya.sharma@email.com',
        'carlos.santos@email.com',
        'fatima.ali@email.com',
        'yuki.tanaka@email.com',
        'elena.popov@email.com',
        'james.okonkwo@email.com',
        'sofia.garcia@email.com',
        'test@test.com'
      )
    `);
    
    console.log(`\n\nSeed users found: ${seedUsers.rowCount}`);
    if (seedUsers.rowCount > 0) {
      seedUsers.rows.forEach((user) => {
        console.log(`  - ${user.full_name} (${user.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkLikes();

