import { pool } from '../connection.js';

async function addUsername() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding username field to users table...');
    
    await client.query('BEGIN');

    // Add username column
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
    `);
    console.log('✅ Added username column');

    // Create index for username lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
    console.log('✅ Created username index');

    // Generate usernames for existing users (email prefix)
    await client.query(`
      WITH candidates AS (
        SELECT id, LOWER(SPLIT_PART(email, '@', 1)) AS base
        FROM users
        WHERE username IS NULL
      ),
      normalized AS (
        SELECT id, LEFT(base, 50) AS base
        FROM candidates
      ),
      ranked AS (
        SELECT id, base, ROW_NUMBER() OVER (PARTITION BY base ORDER BY id) AS rn
        FROM normalized
      ),
      resolved AS (
        SELECT
          id,
          CASE
            WHEN rn = 1 AND NOT EXISTS (
              SELECT 1 FROM users u2 WHERE u2.username = base
            ) THEN base
            ELSE LEFT(base, 12) || '_' || id::text
          END AS username
        FROM ranked
      )
      UPDATE users u
      SET username = resolved.username
      FROM resolved
      WHERE u.id = resolved.id;
    `);
    console.log('✅ Generated usernames for existing users');

    await client.query('COMMIT');
    console.log('✅ Username migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addUsername().catch(console.error);

