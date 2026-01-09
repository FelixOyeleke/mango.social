import { pool } from './dist/db/connection.js';

async function testHashtag() {
  try {
    console.log('🔍 Testing hashtag #sorosoke...\n');
    
    // Check if hashtag exists
    const hashtagResult = await pool.query(
      'SELECT * FROM hashtags WHERE name = $1',
      ['sorosoke']
    );
    
    console.log('📊 Hashtag data:');
    console.log(JSON.stringify(hashtagResult.rows, null, 2));
    console.log('');
    
    // Check stories with this hashtag
    const storiesResult = await pool.query(`
      SELECT 
        s.id, 
        s.title, 
        s.status, 
        s.published_at,
        u.full_name as author_name
      FROM stories s
      JOIN story_hashtags sh ON s.id = sh.story_id
      JOIN hashtags h ON sh.hashtag_id = h.id
      JOIN users u ON s.author_id = u.id
      WHERE h.name = $1
    `, ['sorosoke']);
    
    console.log('📝 Stories with #sorosoke:');
    console.log(JSON.stringify(storiesResult.rows, null, 2));
    console.log('');
    
    // Check what the API query would return
    const apiResult = await pool.query(`
      SELECT 
        s.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT r.id) as reposts_count,
        false as is_liked_by_user,
        false as is_bookmarked_by_user,
        false as is_reposted_by_user
      FROM stories s
      JOIN users u ON s.author_id = u.id
      JOIN story_hashtags sh ON s.id = sh.story_id
      JOIN hashtags h ON sh.hashtag_id = h.id
      LEFT JOIN likes l ON s.id = l.story_id
      LEFT JOIN comments c ON s.id = c.story_id
      LEFT JOIN reposts r ON s.id = r.story_id
      WHERE h.name = $1 AND s.status = 'published'
      GROUP BY s.id, u.full_name, u.avatar_url
      ORDER BY s.published_at DESC
      LIMIT 20
    `, ['sorosoke']);
    
    console.log('🎯 API query result:');
    console.log(`Found ${apiResult.rows.length} stories`);
    if (apiResult.rows.length > 0) {
      console.log(JSON.stringify(apiResult.rows.map(r => ({
        id: r.id,
        title: r.title,
        status: r.status,
        author: r.author_name,
        published_at: r.published_at
      })), null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testHashtag();

