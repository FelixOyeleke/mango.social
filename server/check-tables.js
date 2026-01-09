// Check what tables exist in the database
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

async function checkTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking database tables...\n');
    
    // Get all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tables in database:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (tables.rows.length === 0) {
      console.log('❌ No tables found!');
      console.log('   Run: npm run db:migrate\n');
      return;
    }
    
    const requiredTables = ['users', 'stories', 'comments', 'jobs', 'communities', 'messages'];
    const existingTables = tables.rows.map(r => r.table_name);
    
    for (const table of requiredTables) {
      const exists = existingTables.includes(table);
      const emoji = exists ? '✅' : '❌';
      console.log(`${emoji} ${table}`);
      
      if (exists) {
        // Get count
        const count = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   Records: ${count.rows[0].count}`);
      }
    }
    
    console.log('\n📋 All tables:');
    existingTables.forEach((table, i) => {
      console.log(`${i + 1}. ${table}`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    
    // Check for missing tables
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing tables:', missingTables.join(', '));
      console.log('   These tables are needed for the admin dashboard');
      console.log('   Run the appropriate migrations to create them\n');
    } else {
      console.log('\n✅ All required tables exist!\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables().catch(console.error);

