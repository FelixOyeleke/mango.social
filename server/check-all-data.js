// Check all data in database
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkAllData() {
  const client = await pool.connect();
  
  try {
    console.log('\n📊 DATABASE OVERVIEW\n');
    console.log('='.repeat(60));
    
    // Overall counts
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM stories) as stories,
        (SELECT COUNT(*) FROM likes) as likes,
        (SELECT COUNT(*) FROM bookmarks) as bookmarks,
        (SELECT COUNT(*) FROM reposts) as reposts,
        (SELECT COUNT(*) FROM comments) as comments,
        (SELECT COUNT(*) FROM messages) as messages
    `);
    
    console.log('\n📈 TOTAL COUNTS:');
    console.log(`   Users: ${counts.rows[0].users}`);
    console.log(`   Stories: ${counts.rows[0].stories}`);
    console.log(`   Likes: ${counts.rows[0].likes}`);
    console.log(`   Bookmarks: ${counts.rows[0].bookmarks}`);
    console.log(`   Reposts: ${counts.rows[0].reposts}`);
    console.log(`   Comments: ${counts.rows[0].comments}`);
    console.log(`   Messages: ${counts.rows[0].messages}`);
    
    // Check likes
    console.log('\n\n❤️  LIKES:');
    const likes = await client.query(`
      SELECT l.id, u.email, u.full_name, s.title
      FROM likes l
      JOIN users u ON l.user_id = u.id
      JOIN stories s ON l.story_id = s.id
      ORDER BY l.created_at DESC
    `);
    
    if (likes.rowCount > 0) {
      console.log(`   Total: ${likes.rowCount}`);
      likes.rows.forEach((like, i) => {
        console.log(`   ${i + 1}. ${like.full_name} (${like.email}) liked "${like.title.substring(0, 40)}..."`);
      });
    } else {
      console.log('   No likes found ✅');
    }
    
    // Check bookmarks
    console.log('\n\n🔖 BOOKMARKS:');
    const bookmarks = await client.query(`
      SELECT b.id, u.email, u.full_name, s.title
      FROM bookmarks b
      JOIN users u ON b.user_id = u.id
      JOIN stories s ON b.story_id = s.id
      ORDER BY b.created_at DESC
    `);
    
    if (bookmarks.rowCount > 0) {
      console.log(`   Total: ${bookmarks.rowCount}`);
      bookmarks.rows.forEach((bookmark, i) => {
        console.log(`   ${i + 1}. ${bookmark.full_name} (${bookmark.email}) bookmarked "${bookmark.title.substring(0, 40)}..."`);
      });
    } else {
      console.log('   No bookmarks found ✅');
    }
    
    // Check reposts
    console.log('\n\n🔄 REPOSTS:');
    const reposts = await client.query(`
      SELECT r.id, u.email, u.full_name, s.title, r.comment
      FROM reposts r
      JOIN users u ON r.user_id = u.id
      JOIN stories s ON r.story_id = s.id
      ORDER BY r.created_at DESC
    `);
    
    if (reposts.rowCount > 0) {
      console.log(`   Total: ${reposts.rowCount}`);
      reposts.rows.forEach((repost, i) => {
        console.log(`   ${i + 1}. ${repost.full_name} (${repost.email}) reposted "${repost.title.substring(0, 40)}..."`);
        if (repost.comment) {
          console.log(`      Comment: "${repost.comment}"`);
        }
      });
    } else {
      console.log('   No reposts found ✅');
    }
    
    // Check comments
    console.log('\n\n💬 COMMENTS:');
    const comments = await client.query(`
      SELECT c.id, u.email, u.full_name, s.title, c.content
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN stories s ON c.story_id = s.id
      ORDER BY c.created_at DESC
      LIMIT 20
    `);
    
    if (comments.rowCount > 0) {
      console.log(`   Total: ${comments.rowCount} (showing first 20)`);
      comments.rows.forEach((comment, i) => {
        console.log(`   ${i + 1}. ${comment.full_name} (${comment.email}) on "${comment.title.substring(0, 30)}..."`);
        console.log(`      "${comment.content.substring(0, 60)}..."`);
      });
    } else {
      console.log('   No comments found ✅');
    }
    
    // Check stories
    console.log('\n\n📝 STORIES:');
    const stories = await client.query(`
      SELECT s.id, s.title, u.email, u.full_name,
             (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comments_count,
             (SELECT COUNT(*) FROM reposts WHERE story_id = s.id) as reposts_count
      FROM stories s
      JOIN users u ON s.author_id = u.id
      ORDER BY s.created_at DESC
    `);
    
    if (stories.rowCount > 0) {
      console.log(`   Total: ${stories.rowCount}`);
      stories.rows.forEach((story, i) => {
        console.log(`   ${i + 1}. "${story.title.substring(0, 50)}..." by ${story.full_name} (${story.email})`);
        console.log(`      Likes: ${story.likes_count}, Comments: ${story.comments_count}, Reposts: ${story.reposts_count}`);
      });
    } else {
      console.log('   No stories found ✅');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Check complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAllData();

