import { pool } from './src/db/connection.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Creating test user...');
    
    const email = 'test@test.com';
    const password = 'password123';
    const full_name = 'Test User';
    
    // Check if user already exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Test user already exists!');
      console.log('\n📧 Email: test@test.com');
      console.log('🔑 Password: password123');
      return;
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 12);
    
    // Create user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, 'user', true)
       RETURNING id, email, full_name`,
      [email, password_hash, full_name]
    );
    
    console.log('✅ Test user created successfully!');
    console.log('\n📧 Email: test@test.com');
    console.log('🔑 Password: password123');
    console.log('\nYou can now sign in with these credentials.');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUser().catch(console.error);

