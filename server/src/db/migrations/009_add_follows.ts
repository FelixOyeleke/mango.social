import { pool } from '../connection.js';

async function addFollows() {
  const client = await pool.connect();

  try {
    console.log('Creating follows table and counters...');

    await client.query('BEGIN');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS follows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id),
        CHECK (follower_id <> following_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
      CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
    `);

    await client.query('UPDATE users SET followers_count = 0, following_count = 0;');

    await client.query(`
      UPDATE users u
      SET followers_count = f.count
      FROM (
        SELECT following_id, COUNT(*) AS count
        FROM follows
        GROUP BY following_id
      ) f
      WHERE u.id = f.following_id;
    `);

    await client.query(`
      UPDATE users u
      SET following_count = f.count
      FROM (
        SELECT follower_id, COUNT(*) AS count
        FROM follows
        GROUP BY follower_id
      ) f
      WHERE u.id = f.follower_id;
    `);

    await client.query('COMMIT');
    console.log('Follows migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addFollows().catch(console.error);
