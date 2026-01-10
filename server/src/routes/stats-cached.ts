import express, { Request } from 'express';
import { query } from '../db/connection.js';
import { cache } from '../db/redis.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const optionalAuthenticate: express.RequestHandler = (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  return next();
};

// Get community stats (with Redis caching)
router.get('/community', async (req, res, next) => {
  try {
    // Try to get from cache first
    const cached = await cache.getCommunityStats();
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // If not in cache, query database
    const [usersCount, storiesCount, countriesCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM stories WHERE status = \'published\''),
      query('SELECT COUNT(DISTINCT country_of_origin) as count FROM users WHERE country_of_origin IS NOT NULL'),
    ]);
    
    const activeUsers = await query(`
      SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT author_id as user_id FROM stories WHERE created_at > NOW() - INTERVAL '24 hours'
        UNION
        SELECT user_id FROM comments WHERE created_at > NOW() - INTERVAL '24 hours'
      ) as active
    `);
    
    const data = {
      totalMembers: parseInt(usersCount.rows[0].count),
      totalStories: parseInt(storiesCount.rows[0].count),
      activeNow: parseInt(activeUsers.rows[0].count),
      countries: parseInt(countriesCount.rows[0].count),
    };

    // Cache for 10 minutes
    await cache.setCommunityStats(data, 600);
    
    res.json({
      success: true,
      data,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
});

// Get trending topics (with Redis caching)
router.get('/trending', async (req, res, next) => {
  try {
    // Try cache first
    const cached = await cache.getTrending();
    if (cached) {
      return res.json({
        success: true,
        data: { trending: cached },
        cached: true,
      });
    }

    // Query database
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
    
    // Cache for 5 minutes
    await cache.setTrending(trending, 300);
    
    res.json({
      success: true,
      data: { trending },
      cached: false,
    });
  } catch (error) {
    next(error);
  }
});

// Get suggested users (with Redis caching)
router.get('/suggested-users', optionalAuthenticate, async (req: Request, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const currentUserId = req.user?.id || null;
    const allowCache = !currentUserId;
    
    // Try cache first
    if (allowCache) {
      const cached = await cache.getSuggestedUsers();
      if (cached) {
        return res.json({
          success: true,
          data: { users: cached.slice(0, limit) },
          cached: true,
        });
      }
    }

    // Query database
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
      LIMIT 20
    `, [currentUserId]);
    
    const users = result.rows.map(user => ({
      id: user.id,
      name: user.full_name,
      bio: user.bio || null,
      avatar: user.avatar_url,
      mutual: Number(user.mutual_count) || 0,
      storyCount: parseInt(user.story_count),
    }));
    
    // Cache for 15 minutes
    if (allowCache) {
      await cache.setSuggestedUsers(users, 900);
    }
    
    res.json({
      success: true,
      data: { users: users.slice(0, limit) },
      cached: false,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
