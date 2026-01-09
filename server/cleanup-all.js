// Complete cleanup: Remove all seed data and publish drafts
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SEED_USER_EMAILS = [
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
];

async function cleanupAll() {
  const client = await pool.connect();
  
  try {
    console.log('\n🧹 COMPLETE CLEANUP SCRIPT\n');
    console.log('='.repeat(60));
    
    await client.query('BEGIN');
    
    // Show before state
    const before = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM likes) as likes,
        (SELECT COUNT(*) FROM bookmarks) as bookmarks,
        (SELECT COUNT(*) FROM reposts) as reposts,
        (SELECT COUNT(*) FROM stories) as stories,
        (SELECT COUNT(*) FROM comments) as comments,
        (SELECT COUNT(*) FROM stories WHERE status = 'draft') as drafts
    `);
    
    console.log('\n📊 BEFORE CLEANUP:');
    console.log(`   Likes: ${before.rows[0].likes}`);
    console.log(`   Bookmarks: ${before.rows[0].bookmarks}`);
    console.log(`   Reposts: ${before.rows[0].reposts}`);
    console.log(`   Stories: ${before.rows[0].stories} (${before.rows[0].drafts} drafts)`);
    console.log(`   Comments: ${before.rows[0].comments}`);
    
    console.log('\n🗑️  CLEANING SEED DATA...\n');
    
    // 1. Delete fake likes
    const likesResult = await client.query(`
      DELETE FROM likes 
      WHERE user_id IN (
        SELECT id FROM users WHERE email = ANY($1::text[])
      )
    `, [SEED_USER_EMAILS]);
    console.log(`   ✅ Deleted ${likesResult.rowCount} fake likes`);
    
    // 2. Delete fake bookmarks
    const bookmarksResult = await client.query(`
      DELETE FROM bookmarks 
      WHERE user_id IN (
        SELECT id FROM users WHERE email = ANY($1::text[])
      )
    `, [SEED_USER_EMAILS]);
    console.log(`   ✅ Deleted ${bookmarksResult.rowCount} fake bookmarks`);
    
    // 3. Delete fake reposts
    const repostsResult = await client.query(`
      DELETE FROM reposts 
      WHERE user_id IN (
        SELECT id FROM users WHERE email = ANY($1::text[])
      )
    `, [SEED_USER_EMAILS]);
    console.log(`   ✅ Deleted ${repostsResult.rowCount} fake reposts`);
    
    // 4. Delete seed comments
    const commentsResult = await client.query(`
      DELETE FROM comments 
      WHERE user_id IN (
        SELECT id FROM users WHERE email = ANY($1::text[])
      )
    `, [SEED_USER_EMAILS]);
    console.log(`   ✅ Deleted ${commentsResult.rowCount} seed comments`);
    
    // 5. Delete seed stories
    const storiesResult = await client.query(`
      DELETE FROM stories 
      WHERE author_id IN (
        SELECT id FROM users WHERE email = ANY($1::text[])
      )
    `, [SEED_USER_EMAILS]);
    console.log(`   ✅ Deleted ${storiesResult.rowCount} seed stories`);
    
    console.log('\n📝 PUBLISHING DRAFT STORIES...\n');
    
    // 6. Publish all remaining drafts
    const publishResult = await client.query(`
      UPDATE stories 
      SET status = 'published', 
          published_at = COALESCE(published_at, NOW())
      WHERE status = 'draft'
      RETURNING id, title
    `);
    
    if (publishResult.rowCount > 0) {
      console.log(`   ✅ Published ${publishResult.rowCount} draft stories:`);
      publishResult.rows.forEach((story, i) => {
        console.log(`      ${i + 1}. "${story.title.substring(0, 50)}..."`);
      });
    } else {
      console.log(`   ℹ️  No draft stories to publish`);
    }
    
    await client.query('COMMIT');
    
    // Show after state
    const after = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM likes) as likes,
        (SELECT COUNT(*) FROM bookmarks) as bookmarks,
        (SELECT COUNT(*) FROM reposts) as reposts,
        (SELECT COUNT(*) FROM stories) as stories,
        (SELECT COUNT(*) FROM comments) as comments,
        (SELECT COUNT(*) FROM stories WHERE status = 'draft') as drafts,
        (SELECT COUNT(*) FROM stories WHERE status = 'published') as published
    `);
    
    console.log('\n📊 AFTER CLEANUP:');
    console.log(`   Likes: ${after.rows[0].likes}`);
    console.log(`   Bookmarks: ${after.rows[0].bookmarks}`);
    console.log(`   Reposts: ${after.rows[0].reposts}`);
    console.log(`   Stories: ${after.rows[0].stories} (${after.rows[0].published} published, ${after.rows[0].drafts} drafts)`);
    console.log(`   Comments: ${after.rows[0].comments}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ CLEANUP COMPLETE!\n');
    console.log('Your app is now ready:');
    console.log('  • All fake seed data removed');
    console.log('  • All posts are published and visible');
    console.log('  • Like counters will work correctly');
    console.log('  • New posts will appear immediately in feed\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error during cleanup:', error);
    console.log('\n⚠️  Changes have been rolled back.\n');
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupAll();

