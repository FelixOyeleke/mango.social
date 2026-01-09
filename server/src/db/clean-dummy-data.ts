import { pool } from './connection.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function cleanDummyData() {
  try {
    console.log('\n🧹 Clean Dummy/Seed Data Script\n');
    console.log('This script will remove ONLY the dummy data created by the seed script.');
    console.log('✅ Your real user data (likes, messages, reposts, saves) will be preserved!\n');

    // Show what will be deleted
    const storiesCount = await pool.query('SELECT COUNT(*) FROM stories');
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const likesCount = await pool.query('SELECT COUNT(*) FROM likes');
    const commentsCount = await pool.query('SELECT COUNT(*) FROM comments');
    const bookmarksCount = await pool.query('SELECT COUNT(*) FROM bookmarks');
    const repostsCount = await pool.query('SELECT COUNT(*) FROM reposts');
    const messagesCount = await pool.query('SELECT COUNT(*) FROM messages');

    console.log('Current database contents:');
    console.log(`  📝 Stories: ${storiesCount.rows[0].count}`);
    console.log(`  👥 Users: ${usersCount.rows[0].count}`);
    console.log(`  ❤️  Likes: ${likesCount.rows[0].count}`);
    console.log(`  💬 Comments: ${commentsCount.rows[0].count}`);
    console.log(`  🔖 Bookmarks: ${bookmarksCount.rows[0].count}`);
    console.log(`  🔄 Reposts: ${repostsCount.rows[0].count}`);
    console.log(`  💌 Messages: ${messagesCount.rows[0].count}\n`);

    const answer = await question('What would you like to clean?\n' +
      '1. Clean seed stories, comments, AND fake likes/bookmarks (RECOMMENDED)\n' +
      '2. Clean seed users (keeps admin and real users)\n' +
      '3. Clean ALL seed data (stories, comments, likes, bookmarks, seed users)\n' +
      '4. Cancel\n' +
      '\n' +
      '⚠️  NOTE: Option 1 removes fake likes created by seed users.\n' +
      '   This fixes the "jumping counter" issue (5→51, 3→31).\n' +
      '\nEnter your choice (1-4): ');

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      switch (answer.trim()) {
        case '1':
          console.log('\n🗑️  Cleaning seed stories, comments, and fake interactions...');
          console.log('   ℹ️  This will remove stories and fake likes/bookmarks created by seed users.');
          console.log('   ✅ Real user likes, bookmarks, reposts, and messages will be preserved!\n');

          // Get seed user IDs (users created by seed script)
          const seedUsers = await client.query(`
            SELECT id FROM users
            WHERE email IN (
              'maria.rodriguez@email.com',
              'ahmed.hassan@email.com',
              'li.wei@email.com',
              'priya.sharma@email.com',
              'carlos.santos@email.com',
              'fatima.ali@email.com',
              'yuki.tanaka@email.com',
              'elena.popov@email.com',
              'james.okonkwo@email.com',
              'sofia.garcia@email.com',
              'test@test.com'
            )
          `);

          const seedUserIds = seedUsers.rows.map(u => u.id);

          if (seedUserIds.length > 0) {
            // Delete likes by seed users (fake likes)
            const likesResult = await client.query(
              'DELETE FROM likes WHERE user_id = ANY($1::uuid[])',
              [seedUserIds]
            );
            console.log(`   ✅ Deleted ${likesResult.rowCount} fake likes by seed users`);

            // Delete bookmarks by seed users (fake bookmarks)
            const bookmarksResult = await client.query(
              'DELETE FROM bookmarks WHERE user_id = ANY($1::uuid[])',
              [seedUserIds]
            );
            console.log(`   ✅ Deleted ${bookmarksResult.rowCount} fake bookmarks by seed users`);

            // Delete reposts by seed users
            const repostsResult = await client.query(
              'DELETE FROM reposts WHERE user_id = ANY($1::uuid[])',
              [seedUserIds]
            );
            console.log(`   ✅ Deleted ${repostsResult.rowCount} fake reposts by seed users`);

            // Delete stories created by seed users
            const deleteResult = await client.query(
              'DELETE FROM stories WHERE author_id = ANY($1::uuid[])',
              [seedUserIds]
            );
            console.log(`   ✅ Deleted ${deleteResult.rowCount} seed stories`);

            // Delete comments by seed users
            const commentsResult = await client.query(
              'DELETE FROM comments WHERE user_id = ANY($1::uuid[])',
              [seedUserIds]
            );
            console.log(`   ✅ Deleted ${commentsResult.rowCount} seed comments`);
          } else {
            console.log('   ℹ️  No seed users found.');
          }
          break;

        case '2':
          console.log('\n🗑️  Cleaning seed users...');
          console.log('   ℹ️  This will remove users created by the seed script.');
          console.log('   ✅ Admin users and real users will be preserved!\n');

          const deleteUsersResult = await client.query(`
            DELETE FROM users
            WHERE email IN (
              'maria.rodriguez@email.com',
              'ahmed.hassan@email.com',
              'li.wei@email.com',
              'priya.sharma@email.com',
              'carlos.santos@email.com',
              'fatima.ali@email.com',
              'yuki.tanaka@email.com',
              'elena.popov@email.com',
              'james.okonkwo@email.com',
              'sofia.garcia@email.com',
              'test@test.com'
            )
            AND role != 'admin'
          `);
          console.log(`   ✅ Deleted ${deleteUsersResult.rowCount} seed users`);
          break;

        case '3':
          console.log('\n🗑️  Cleaning ALL seed data...');
          console.log('   ℹ️  This will remove all seed stories, comments, likes, bookmarks, and users.');
          console.log('   ✅ Real user data and interactions will be preserved!\n');

          // Get seed user IDs
          const allSeedUsers = await client.query(`
            SELECT id FROM users
            WHERE email IN (
              'maria.rodriguez@email.com',
              'ahmed.hassan@email.com',
              'li.wei@email.com',
              'priya.sharma@email.com',
              'carlos.santos@email.com',
              'fatima.ali@email.com',
              'yuki.tanaka@email.com',
              'elena.popov@email.com',
              'james.okonkwo@email.com',
              'sofia.garcia@email.com',
              'test@test.com'
            )
          `);

          const allSeedUserIds = allSeedUsers.rows.map(u => u.id);

          if (allSeedUserIds.length > 0) {
            // Delete likes by seed users
            const likesDeleted = await client.query(
              'DELETE FROM likes WHERE user_id = ANY($1::uuid[])',
              [allSeedUserIds]
            );
            console.log(`   ✅ Deleted ${likesDeleted.rowCount} fake likes`);

            // Delete bookmarks by seed users
            const bookmarksDeleted = await client.query(
              'DELETE FROM bookmarks WHERE user_id = ANY($1::uuid[])',
              [allSeedUserIds]
            );
            console.log(`   ✅ Deleted ${bookmarksDeleted.rowCount} fake bookmarks`);

            // Delete reposts by seed users
            const repostsDeleted = await client.query(
              'DELETE FROM reposts WHERE user_id = ANY($1::uuid[])',
              [allSeedUserIds]
            );
            console.log(`   ✅ Deleted ${repostsDeleted.rowCount} fake reposts`);

            // Delete stories
            const storiesDeleted = await client.query(
              'DELETE FROM stories WHERE author_id = ANY($1::uuid[])',
              [allSeedUserIds]
            );
            console.log(`   ✅ Deleted ${storiesDeleted.rowCount} seed stories`);

            // Delete comments
            const commentsDeleted = await client.query(
              'DELETE FROM comments WHERE user_id = ANY($1::uuid[])',
              [allSeedUserIds]
            );
            console.log(`   ✅ Deleted ${commentsDeleted.rowCount} seed comments`);

            // Delete seed users (except admins)
            const usersDeleted = await client.query(
              'DELETE FROM users WHERE id = ANY($1::uuid[]) AND role != \'admin\'',
              [allSeedUserIds]
            );
            console.log(`   ✅ Deleted ${usersDeleted.rowCount} seed users`);
          }
          break;

        case '4':
          console.log('\n❌ Cancelled.');
          await client.query('ROLLBACK');
          client.release();
          rl.close();
          await pool.end();
          return;

        default:
          console.log('\n❌ Invalid choice. Cancelled.');
          await client.query('ROLLBACK');
          client.release();
          rl.close();
          await pool.end();
          return;
      }

      await client.query('COMMIT');
      console.log('\n✅ Database cleaned successfully!\n');

      // Show updated counts
      const newStoriesCount = await pool.query('SELECT COUNT(*) FROM stories');
      const newUsersCount = await pool.query('SELECT COUNT(*) FROM users');
      const newLikesCount = await pool.query('SELECT COUNT(*) FROM likes');
      const newCommentsCount = await pool.query('SELECT COUNT(*) FROM comments');
      const newBookmarksCount = await pool.query('SELECT COUNT(*) FROM bookmarks');
      const newRepostsCount = await pool.query('SELECT COUNT(*) FROM reposts');
      const newMessagesCount = await pool.query('SELECT COUNT(*) FROM messages');

      console.log('Updated database contents:');
      console.log(`  📝 Stories: ${newStoriesCount.rows[0].count}`);
      console.log(`  👥 Users: ${newUsersCount.rows[0].count}`);
      console.log(`  ❤️  Likes: ${newLikesCount.rows[0].count}`);
      console.log(`  💬 Comments: ${newCommentsCount.rows[0].count}`);
      console.log(`  🔖 Bookmarks: ${newBookmarksCount.rows[0].count}`);
      console.log(`  🔄 Reposts: ${newRepostsCount.rows[0].count}`);
      console.log(`  💌 Messages: ${newMessagesCount.rows[0].count}\n`);

      console.log('✅ All your real user data has been preserved!');

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error cleaning database:', error);
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    await pool.end();
  }
}

cleanDummyData();

