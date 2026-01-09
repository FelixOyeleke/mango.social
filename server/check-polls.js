import { pool } from './dist/db/connection.js';

async function checkPolls() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('polls', 'poll_options', 'poll_votes')
      ORDER BY table_name
    `);
    
    console.log('Poll tables found:', result.rows.map(r => r.table_name));
    
    if (result.rows.length === 0) {
      console.log('\n❌ No poll tables found. Need to run migration.');
    } else if (result.rows.length === 3) {
      console.log('\n✅ All poll tables exist!');
    } else {
      console.log('\n⚠️  Some poll tables missing:', result.rows.map(r => r.table_name));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPolls();

