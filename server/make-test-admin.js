// Simple JavaScript version to make test user an admin
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'immigrant_voices',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function makeTestAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Looking for "test" user...\n');

    // Check if username column exists
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'username'
    `);
    const hasUsername = columnCheck.rows.length > 0;

    // Find test user
    const testUser = await client.query(
      hasUsername
        ? `SELECT id, email, full_name, username, role
           FROM users
           WHERE email LIKE '%test%'
              OR username LIKE '%test%'
              OR full_name LIKE '%test%'
           LIMIT 1`
        : `SELECT id, email, full_name, role
           FROM users
           WHERE email LIKE '%test%'
              OR full_name LIKE '%test%'
           LIMIT 1`
    );
    
    if (testUser.rows.length === 0) {
      console.log('❌ No "test" user found!\n');
      console.log('📋 Available users:');

      const allUsers = await client.query(
        hasUsername
          ? `SELECT email, full_name, username, role FROM users ORDER BY created_at DESC`
          : `SELECT email, full_name, role FROM users ORDER BY created_at DESC`
      );

      allUsers.rows.forEach((user, i) => {
        console.log(`${i + 1}. ${user.full_name} (${user.email}) - ${user.role}`);
      });
      
      return;
    }
    
    const user = testUser.rows[0];
    console.log(`✅ Found user: ${user.full_name} (${user.email})`);
    console.log(`   Current role: ${user.role}\n`);
    
    if (user.role === 'admin') {
      console.log('✅ User is already an admin!\n');
    } else {
      // Make admin
      await client.query(`
        UPDATE users 
        SET role = 'admin' 
        WHERE id = $1
      `, [user.id]);
      
      console.log('✅ Successfully updated user to admin!\n');
    }
    
    // List all users
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 ALL USERS IN DATABASE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const allUsers = await client.query(
      hasUsername
        ? `SELECT id, email, full_name, username, role, is_active, email_verified, created_at
           FROM users ORDER BY created_at DESC`
        : `SELECT id, email, full_name, role, is_active, email_verified, created_at
           FROM users ORDER BY created_at DESC`
    );

    allUsers.rows.forEach((u, i) => {
      const roleEmoji = u.role === 'admin' ? '🔐' : u.role === 'moderator' ? '⭐' : '👤';
      const statusEmoji = u.is_active ? '✅' : '❌';

      console.log(`${i + 1}. ${roleEmoji} ${u.full_name}`);
      console.log(`   Email: ${u.email}`);
      if (hasUsername && u.username) console.log(`   Username: @${u.username}`);
      console.log(`   Role: ${u.role.toUpperCase()}`);
      console.log(`   Status: ${statusEmoji} ${u.is_active ? 'Active' : 'Inactive'}`);
      console.log(`   Email Verified: ${u.email_verified ? 'Yes' : 'No'}`);
      console.log(`   Created: ${new Date(u.created_at).toLocaleDateString()}`);
      console.log('');
    });
    
    // List admins
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔐 ADMIN USERS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const admins = await client.query(
      hasUsername
        ? `SELECT email, full_name, username FROM users WHERE role = 'admin' ORDER BY created_at`
        : `SELECT email, full_name FROM users WHERE role = 'admin' ORDER BY created_at`
    );

    if (admins.rows.length === 0) {
      console.log('⚠️  No admin users found!\n');
    } else {
      admins.rows.forEach((admin, i) => {
        console.log(`${i + 1}. ${admin.full_name}`);
        console.log(`   Email: ${admin.email}`);
        if (hasUsername && admin.username) console.log(`   Username: @${admin.username}`);
        console.log('');
      });

      console.log(`Total admins: ${admins.rows.length}\n`);
    }
    
    // Summary
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'admin') as admins,
        COUNT(*) FILTER (WHERE role = 'moderator') as moderators,
        COUNT(*) FILTER (WHERE role = 'user') as users,
        COUNT(*) FILTER (WHERE is_active = true) as active
      FROM users
    `);
    
    const s = stats.rows[0];
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📈 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Total Users: ${s.total}`);
    console.log(`Active Users: ${s.active}`);
    console.log(`Admins: ${s.admins}`);
    console.log(`Moderators: ${s.moderators}`);
    console.log(`Regular Users: ${s.users}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

makeTestAdmin().catch(console.error);

