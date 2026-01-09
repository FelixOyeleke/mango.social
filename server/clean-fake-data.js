// Simple script to clean fake likes/bookmarks/reposts created by seed users
// Run with: node clean-fake-data.js

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanFakeData() {
  const client = await pool.connect();
  
  try {
    console.log('\n🧹 Cleaning fake likes, bookmarks, and reposts...\n');
    
    await client.query('BEGIN');
    
    // Show current counts
    const before = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM likes) as likes,
        (SELECT COUNT(*) FROM bookmarks) as bookmarks,
        (SELECT COUNT(*) FROM reposts) as reposts,
        (SELECT COUNT(*) FROM stories) as stories
    `);
    
    console.log('📊 Before cleanup:');
    console.log(`   Likes: ${before.rows[0].likes}`);
    console.log(`   Bookmarks: ${before.rows[0].bookmarks}`);
    console.log(`   Reposts: ${before.rows[0].reposts}`);
    console.log(`   Stories: ${before.rows[0].stories}\n`);
    
    // Delete fake likes
    const likesResult = await client.query(`
      DELETE FROM likes
      WHERE user_id IN (
        SELECT id FROM users
        WHERE email IN (
          'elena.popov@email.com',
          'ahmed.hassan@email.com',
          'maria.rodriguez@email.com',
          'carlos.santos@email.com',
          'li.wei@email.com',
          'priya.sharma@email.com',
          'sofia.garcia@email.com',
          'james.okonkwo@email.com',
          'yuki.tanaka@email.com',
          'fatima.ali@email.com'
        )
      )
    `);
    console.log(`✅ Deleted ${likesResult.rowCount} fake likes`);
    
    // Delete fake bookmarks
    const bookmarksResult = await client.query(`
      DELETE FROM bookmarks
      WHERE user_id IN (
        SELECT id FROM users
        WHERE email IN (
          'elena.popov@email.com',
          'ahmed.hassan@email.com',
          'maria.rodriguez@email.com',
          'carlos.santos@email.com',
          'li.wei@email.com',
          'priya.sharma@email.com',
          'sofia.garcia@email.com',
          'james.okonkwo@email.com',
          'yuki.tanaka@email.com',
          'fatima.ali@email.com'
        )
      )
    `);
    console.log(`✅ Deleted ${bookmarksResult.rowCount} fake bookmarks`);
    
    // Delete fake reposts
    const repostsResult = await client.query(`
      DELETE FROM reposts
      WHERE user_id IN (
        SELECT id FROM users
        WHERE email IN (
          'elena.popov@email.com',
          'ahmed.hassan@email.com',
          'maria.rodriguez@email.com',
          'carlos.santos@email.com',
          'li.wei@email.com',
          'priya.sharma@email.com',
          'sofia.garcia@email.com',
          'james.okonkwo@email.com',
          'yuki.tanaka@email.com',
          'fatima.ali@email.com'
        )
      )
    `);
    console.log(`✅ Deleted ${repostsResult.rowCount} fake reposts`);
    
    // Delete seed stories
    const storiesResult = await client.query(`
      DELETE FROM stories
      WHERE author_id IN (
        SELECT id FROM users
        WHERE email IN (
          'elena.popov@email.com',
          'ahmed.hassan@email.com',
          'maria.rodriguez@email.com',
          'carlos.santos@email.com',
          'li.wei@email.com',
          'priya.sharma@email.com',
          'sofia.garcia@email.com',
          'james.okonkwo@email.com',
          'yuki.tanaka@email.com',
          'fatima.ali@email.com'
        )
      )
    `);
    console.log(`✅ Deleted ${storiesResult.rowCount} seed stories`);
    
    // Delete seed comments
    const commentsResult = await client.query(`
      DELETE FROM comments
      WHERE user_id IN (
        SELECT id FROM users
        WHERE email IN (
          'elena.popov@email.com',
          'ahmed.hassan@email.com',
          'maria.rodriguez@email.com',
          'carlos.santos@email.com',
          'li.wei@email.com',
          'priya.sharma@email.com',
          'sofia.garcia@email.com',
          'james.okonkwo@email.com',
          'yuki.tanaka@email.com',
          'fatima.ali@email.com'
        )
      )
    `);
    console.log(`✅ Deleted ${commentsResult.rowCount} seed comments\n`);
    
    await client.query('COMMIT');
    
    // Show after counts
    const after = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM likes) as likes,
        (SELECT COUNT(*) FROM bookmarks) as bookmarks,
        (SELECT COUNT(*) FROM reposts) as reposts,
        (SELECT COUNT(*) FROM stories) as stories
    `);
    
    console.log('📊 After cleanup:');
    console.log(`   Likes: ${after.rows[0].likes}`);
    console.log(`   Bookmarks: ${after.rows[0].bookmarks}`);
    console.log(`   Reposts: ${after.rows[0].reposts}`);
    console.log(`   Stories: ${after.rows[0].stories}\n`);
    
    console.log('✅ Done! Your like counters should now work correctly.\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanFakeData();

