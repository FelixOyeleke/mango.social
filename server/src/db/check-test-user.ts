import { pool } from './connection.js';

async function checkTestUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for "test" user...\n');
    
    // Check for test user
    const result = await client.query(`
      SELECT id, email, full_name, username, role, is_active, email_verified
      FROM users 
      WHERE email LIKE '%test%' 
         OR username LIKE '%test%' 
         OR full_name LIKE '%test%'
      ORDER BY created_at DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No user with "test" in email, username, or name found\n');
      
      // Show all users
      const allUsers = await client.query(`
        SELECT email, full_name, username, role 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      
      console.log('📋 Recent users in database:');
      allUsers.rows.forEach((user, i) => {
        console.log(`${i + 1}. ${user.full_name} (${user.email}) - Role: ${user.role}`);
        if (user.username) console.log(`   Username: @${user.username}`);
      });
    } else {
      console.log(`✅ Found ${result.rows.length} user(s) matching "test":\n`);
      
      result.rows.forEach((user, i) => {
        console.log(`${i + 1}. ${user.full_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username || 'N/A'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.is_active}`);
        console.log(`   Email Verified: ${user.email_verified}`);
        console.log('');
        
        if (user.role === 'admin') {
          console.log('   🔐 This user IS an admin!\n');
        } else {
          console.log(`   ⚠️  This user is NOT an admin (role: ${user.role})\n`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTestUser().catch(console.error);

