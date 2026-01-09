import { pool } from './connection.js';

async function checkUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking database users...\n');
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist!');
      console.log('   Run: npm run db:migrate');
      return;
    }
    
    console.log('✅ Users table exists\n');
    
    // Count users
    const countResult = await client.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Total users: ${userCount}\n`);
    
    if (userCount === 0) {
      console.log('❌ No users found in database!');
      console.log('   Run: npm run db:seed');
      return;
    }
    
    // Show all users
    const usersResult = await client.query(`
      SELECT email, full_name, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log('👥 Users in database:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n💡 Test Login:');
    console.log('   Email: maria.rodriguez@email.com');
    console.log('   Password: password123');
    console.log('');
    
    // Check for admin
    const adminResult = await client.query(`
      SELECT email, full_name FROM users WHERE role = 'admin'
    `);
    
    if (adminResult.rows.length > 0) {
      console.log('🔐 Admin users found:');
      adminResult.rows.forEach(admin => {
        console.log(`   ${admin.full_name} (${admin.email})`);
      });
    } else {
      console.log('⚠️  No admin users found');
      console.log('   Run: npm run db:create-admin');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkUsers().catch(console.error);

