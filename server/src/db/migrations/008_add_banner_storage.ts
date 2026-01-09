import { pool } from '../connection.js';

async function addBannerStorage() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding banner image storage to users table...');
    
    await client.query('BEGIN');

    // Add banner storage columns
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS banner_data BYTEA,
      ADD COLUMN IF NOT EXISTS banner_mime_type VARCHAR(50);
    `);
    console.log('✅ Added banner storage columns');

    await client.query('COMMIT');
    console.log('✅ Banner storage migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addBannerStorage().catch(console.error);

