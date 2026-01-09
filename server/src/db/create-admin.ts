import { pool } from './connection.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin already exists
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@immigrantvoices.com']
    );
    
    if (existing.rows.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email: admin@immigrantvoices.com');
      console.log('Password: admin123');
      return;
    }
    
    // Create admin user
    const result = await client.query(`
      INSERT INTO users (
        email, 
        password_hash, 
        full_name, 
        avatar_url, 
        bio, 
        country_of_origin, 
        current_location, 
        role,
        email_verified,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, full_name, role
    `, [
      'admin@immigrantvoices.com',
      hashedPassword,
      'Admin User',
      'https://i.pravatar.cc/150?img=68',
      'Platform administrator for Immigrant Voices',
      'United States',
      'San Francisco, USA',
      'admin',
      true,
      true
    ]);
    
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  ADMIN LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('  Email:    admin@immigrantvoices.com');
    console.log('  Password: admin123');
    console.log('  Role:     admin');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password in production!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createAdmin().catch(console.error);

