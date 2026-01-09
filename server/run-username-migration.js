import { pool } from './dist/db/connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Adding username column to users table...');
    
    const migrationPath = path.join(__dirname, 'src', 'db', 'migrations', 'add-username-column.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Username column added successfully!');
    console.log('📝 All existing users now have unique usernames generated from their emails');
    
    // Show some examples
    const result = await pool.query('SELECT id, email, username, full_name FROM users LIMIT 5');
    console.log('\n📋 Sample users with usernames:');
    result.rows.forEach(user => {
      console.log(`  - ${user.full_name} (@${user.username}) - ${user.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

