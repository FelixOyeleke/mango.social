import express from 'express';
import { query } from '../db/connection.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

const optionalAuthenticate: express.RequestHandler = (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req as AuthRequest, res, next);
  }
  return next();
};

// Get community stats
router.get('/community', async (req, res, next) => {
  try {
    const [usersCount, storiesCount, countriesCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM stories WHERE status = \'published\''),
      query('SELECT COUNT(DISTINCT country_of_origin) as count FROM users WHERE country_of_origin IS NOT NULL'),
    ]);
    
    // Get active users (users who have posted or commented in the last 24 hours)
    const activeUsers = await query(`
      SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT author_id as user_id FROM stories WHERE created_at > NOW() - INTERVAL '24 hours'
        UNION
        SELECT user_id FROM comments WHERE created_at > NOW() - INTERVAL '24 hours'
      ) as active
    `);
    
    res.json({
      success: true,
      data: {
        totalMembers: parseInt(usersCount.rows[0].count),
        totalStories: parseInt(storiesCount.rows[0].count),
        activeNow: parseInt(activeUsers.rows[0].count),
        countries: parseInt(countriesCount.rows[0].count),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get trending topics
router.get('/trending', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        unnest(tags) as tag,
        COUNT(*) as post_count,
        SUM(views_count) as total_views
      FROM stories
      WHERE status = 'published' 
        AND published_at > NOW() - INTERVAL '30 days'
        AND tags IS NOT NULL
      GROUP BY tag
      ORDER BY post_count DESC, total_views DESC
      LIMIT 10
    `);
    
    const trending = result.rows.map((row, index) => ({
      tag: row.tag,
      count: `${row.post_count} posts`,
      rank: index + 1,
    }));
    
    res.json({
      success: true,
      data: { trending },
    });
  } catch (error) {
    next(error);
  }
});

// Get suggested users
router.get('/suggested-users', optionalAuthenticate, async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const currentUserId = req.user?.id || null;
    
    const result = await query(`
      SELECT 
        u.id,
        u.full_name,
        u.avatar_url,
        u.bio,
        u.country_of_origin,
        COUNT(DISTINCT s.id) as story_count,
        COUNT(DISTINCT l.id) as total_likes,
        (
          SELECT COUNT(*)
          FROM follows f1
          JOIN follows f2 ON f1.following_id = f2.following_id
          WHERE f1.follower_id = $1 AND f2.follower_id = u.id
        ) as mutual_count
      FROM users u
      LEFT JOIN stories s ON u.id = s.author_id AND s.status = 'published'
      LEFT JOIN likes l ON s.id = l.story_id
      WHERE u.is_active = true
        AND ($1::uuid IS NULL OR u.id <> $1)
      GROUP BY u.id
      ORDER BY total_likes DESC NULLS LAST, story_count DESC NULLS LAST, u.created_at DESC
      LIMIT $2
    `, [currentUserId, limit]);
    
    const users = result.rows.map(user => ({
      id: user.id,
      name: user.full_name,
      bio: user.bio || null,
      avatar: user.avatar_url,
      mutual: Number(user.mutual_count) || 0,
      storyCount: parseInt(user.story_count),
    }));
    
    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
});

// Get trending stories
router.get('/trending-stories', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    
    const result = await query(`
      SELECT 
        s.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count
      FROM stories s
      JOIN users u ON s.author_id = u.id
      LEFT JOIN likes l ON s.id = l.story_id
      LEFT JOIN comments c ON s.id = c.story_id
      WHERE s.status = 'published'
        AND s.published_at > NOW() - INTERVAL '7 days'
      GROUP BY s.id, u.full_name, u.avatar_url
      ORDER BY (COUNT(DISTINCT l.id) + COUNT(DISTINCT c.id) * 2 + s.views_count / 10) DESC
      LIMIT $1
    `, [limit]);
    
    res.json({
      success: true,
      data: { stories: result.rows },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
