// Check all users
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkUsers() {
  const client = await pool.connect();
  
  try {
    console.log('\n👥 All users in database:\n');
    
    const users = await client.query(`
      SELECT id, email, full_name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    console.log(`Total users: ${users.rowCount}\n`);
    
    users.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email}) - Role: ${user.role}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   ID: ${user.id}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkUsers();

