import { pool } from './connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Check all required tables
    const requiredTables = [
      'users',
      'stories',
      'comments',
      'likes',
      'bookmarks',
      'follows',
      'reposts',
      'communities',
      'community_members',
      'conversations',
      'conversation_participants',
      'messages',
      'jobs',
      'job_applications',
      'saved_jobs',
      'companies',
      'images',
      'newsletter_subscribers'
    ];

    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const existingTables = result.rows.map(row => row.table_name);

    console.log('📊 Existing Tables:');
    existingTables.forEach(table => {
      const isRequired = requiredTables.includes(table);
      console.log(`  ${isRequired ? '✅' : '📌'} ${table}`);
    });

    console.log('\n🔍 Missing Tables:');
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('  ✅ All required tables exist!');
    } else {
      missingTables.forEach(table => {
        console.log(`  ❌ ${table}`);
      });
    }

    // Check important columns
    console.log('\n🔍 Checking important columns...\n');

    // Check users table columns
    const usersColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('👤 Users table columns:');
    const requiredUserColumns = [
      'id',
      'email',
      'full_name',
      'username',
      'avatar_url',
      'bio',
      'banner_url',
      'followers_count',
      'following_count'
    ];
    requiredUserColumns.forEach(col => {
      const exists = usersColumns.rows.some(row => row.column_name === col);
      console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });

    // Check stories table columns
    const storiesColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'stories'
      ORDER BY ordinal_position;
    `);

    console.log('\n📝 Stories table columns:');
    const requiredStoryColumns = ['id', 'author_id', 'title', 'content', 'featured_image_url', 'is_repost', 'community_id', 'reposts_count'];
    requiredStoryColumns.forEach(col => {
      const exists = storiesColumns.rows.some(row => row.column_name === col);
      console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });

    // Check indexes
    console.log('\n🔍 Checking indexes...\n');
    const indexes = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);

    console.log('📇 Database Indexes:');
    const tableIndexes: { [key: string]: string[] } = {};
    indexes.rows.forEach(row => {
      if (!tableIndexes[row.tablename]) {
        tableIndexes[row.tablename] = [];
      }
      tableIndexes[row.tablename].push(row.indexname);
    });

    Object.keys(tableIndexes).sort().forEach(table => {
      console.log(`  ${table}: ${tableIndexes[table].length} indexes`);
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total tables: ${existingTables.length}`);
    console.log(`Required tables: ${requiredTables.length}`);
    console.log(`Missing tables: ${missingTables.length}`);
    console.log(`Total indexes: ${indexes.rows.length}`);
    
    if (missingTables.length === 0) {
      console.log('\n✅ Database schema is complete!');
    } else {
      console.log('\n⚠️  Some tables are missing. Run migrations:');
      console.log('   npm run db:migrate');
      console.log('   npm run db:migrate:images');
      console.log('   npm run db:migrate:jobs');
      console.log('   npm run db:migrate:messaging');
      console.log('   npm run db:migrate:features');
      console.log('   npm run db:migrate:username');
      console.log('   npm run db:migrate:banner');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

checkSchema().catch(console.error);
