// Publish all draft stories
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function publishDrafts() {
  const client = await pool.connect();
  
  try {
    console.log('\n📝 Publishing draft stories...\n');
    
    // Check for drafts
    const drafts = await client.query(`
      SELECT s.id, s.title, u.full_name, u.email
      FROM stories s
      JOIN users u ON s.author_id = u.id
      WHERE s.status = 'draft'
      ORDER BY s.created_at DESC
    `);
    
    if (drafts.rowCount === 0) {
      console.log('✅ No draft stories found. All stories are already published!\n');
      return;
    }
    
    console.log(`Found ${drafts.rowCount} draft stories:\n`);
    drafts.rows.forEach((draft, i) => {
      console.log(`${i + 1}. "${draft.title.substring(0, 50)}..." by ${draft.full_name} (${draft.email})`);
    });
    
    console.log('\n🔄 Publishing all drafts...\n');
    
    // Publish all drafts
    const result = await client.query(`
      UPDATE stories 
      SET status = 'published', 
          published_at = COALESCE(published_at, NOW())
      WHERE status = 'draft'
      RETURNING id, title
    `);
    
    console.log(`✅ Published ${result.rowCount} stories!\n`);
    
    result.rows.forEach((story, i) => {
      console.log(`${i + 1}. "${story.title.substring(0, 50)}..."`);
    });
    
    console.log('\n✅ Done! All stories are now visible in the feed.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

publishDrafts();

