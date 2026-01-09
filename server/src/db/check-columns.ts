import { pool } from './connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkColumns() {
  try {
    console.log('🔍 Checking database columns...\n');

    // Check users table columns
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('👤 Users table columns:');
    const requiredUserColumns = ['city', 'country', 'country_code', 'latitude', 'longitude'];
    requiredUserColumns.forEach(col => {
      const exists = usersColumns.rows.some(row => row.column_name === col);
      console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });

    // Check apps table
    const appsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'apps'
      );
    `);
    console.log(`\n📱 Apps table: ${appsTableCheck.rows[0].exists ? '✅' : '❌'}`);

    // Check user_app_preferences table
    const prefsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_app_preferences'
      );
    `);
    console.log(`⚙️  User app preferences table: ${prefsTableCheck.rows[0].exists ? '✅' : '❌'}`);

    console.log('\n📊 Summary:');
    const locationFieldsExist = requiredUserColumns.every(col => 
      usersColumns.rows.some(row => row.column_name === col)
    );
    
    if (!locationFieldsExist) {
      console.log('❌ Location fields missing. Run migration 008:');
      console.log('   psql -U postgres -d immigrant_voices -f src/db/migrations/008_add_location_fields.sql');
    } else {
      console.log('✅ Location fields exist');
    }

    if (!appsTableCheck.rows[0].exists || !prefsTableCheck.rows[0].exists) {
      console.log('❌ App store tables missing. Run migration 009:');
      console.log('   psql -U postgres -d immigrant_voices -f src/db/migrations/009_create_user_app_preferences.sql');
    } else {
      console.log('✅ App store tables exist');
    }

  } catch (error) {
    console.error('❌ Error checking columns:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

checkColumns().catch(console.error);

