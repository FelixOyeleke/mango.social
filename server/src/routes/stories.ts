import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { body, query as queryValidator, validationResult } from 'express-validator';
import { query } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { createLikeNotification } from '../controllers/notificationsController.js';
import { processHashtags } from '../utils/hashtagParser.js';

const router = express.Router();

// Configure multer for story image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Get all stories (public)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const tag = req.query.tag as string;
    const filter = req.query.filter as string; // your-feed, trending, recent, following
    const userId = req.user?.id || null;

    let queryText = `
      SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar,
             u.city as author_city, u.country as author_country,
             (SELECT COUNT(*)::int FROM likes WHERE story_id = s.id) as likes_count,
             (SELECT COUNT(*)::int FROM comments WHERE story_id = s.id) as comments_count,
             COALESCE((SELECT COUNT(*) FROM reposts WHERE story_id = s.id), 0)::int as reposts_count,
             CASE WHEN $1::uuid IS NOT NULL THEN
               EXISTS(SELECT 1 FROM likes WHERE story_id = s.id AND user_id = $1)
             ELSE false END as is_liked_by_user,
             CASE WHEN $1::uuid IS NOT NULL THEN
               EXISTS(SELECT 1 FROM bookmarks WHERE story_id = s.id AND user_id = $1)
             ELSE false END as is_bookmarked_by_user,
             CASE WHEN $1::uuid IS NOT NULL THEN
               EXISTS(SELECT 1 FROM reposts WHERE story_id = s.id AND user_id = $1)
             ELSE false END as is_reposted_by_user
      FROM stories s
      JOIN users u ON s.author_id = u.id
      WHERE s.status = 'published'
    `;
    const params: any[] = [userId];
    let paramCount = 1;

    // Handle filter types
    if (filter === 'following' && userId) {
      // Show posts from users that the current user follows
      queryText += ` AND s.author_id IN (SELECT following_id FROM follows WHERE follower_id = $1)`;
    }

    if (category) {
      paramCount++;
      queryText += ` AND s.category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      queryText += ` AND (s.title ILIKE $${paramCount} OR s.content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (tag) {
      paramCount++;
      queryText += ` AND $${paramCount} = ANY(s.tags)`;
      params.push(tag);
    }

    // Order by filter type
    if (filter === 'trending') {
      // Trending: Order by engagement (likes + comments + views) in the last 7 days
      queryText += ` AND s.published_at > NOW() - INTERVAL '7 days'`;
      queryText += ` ORDER BY (
        (SELECT COUNT(*) FROM likes WHERE story_id = s.id) +
        (SELECT COUNT(*) FROM comments WHERE story_id = s.id) * 2 +
        s.views_count / 10
      ) DESC, s.published_at DESC`;
    } else {
      // Default: Recent posts
      queryText += ` ORDER BY s.published_at DESC`;
    }

    queryText += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM stories WHERE status = \'published\'';
    const countParams: any[] = [];
    if (category) {
      countQuery += ' AND category = $1';
      countParams.push(category);
    }
    if (tag) {
      const position = countParams.length + 1;
      countQuery += ` AND $${position} = ANY(tags)`;
      countParams.push(tag);
    }
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        stories: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single story by slug
router.get('/:slug', async (req: Request, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id || null;

    const result = await query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar, u.bio as author_bio,
              u.city as author_city, u.country as author_country,
              (SELECT COUNT(*)::int FROM likes WHERE story_id = s.id) as likes_count,
              (SELECT COUNT(*)::int FROM comments WHERE story_id = s.id) as comments_count,
              COALESCE((SELECT COUNT(*) FROM reposts WHERE story_id = s.id), 0)::int as reposts_count,
              CASE WHEN $2::uuid IS NOT NULL THEN
                EXISTS(SELECT 1 FROM likes WHERE story_id = s.id AND user_id = $2)
              ELSE false END as is_liked_by_user,
              CASE WHEN $2::uuid IS NOT NULL THEN
                EXISTS(SELECT 1 FROM bookmarks WHERE story_id = s.id AND user_id = $2)
              ELSE false END as is_bookmarked_by_user,
              CASE WHEN $2::uuid IS NOT NULL THEN
                EXISTS(SELECT 1 FROM reposts WHERE story_id = s.id AND user_id = $2)
              ELSE false END as is_reposted_by_user
       FROM stories s
       JOIN users u ON s.author_id = u.id
       WHERE s.slug = $1 AND s.status = 'published'`,
      [slug, userId]
    );

    if (result.rows.length === 0) {
      throw createError('Story not found', 404);
    }

    // Increment view count
    await query('UPDATE stories SET views_count = views_count + 1 WHERE slug = $1', [slug]);

    res.json({
      success: true,
      data: { story: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
});

// Create story (authenticated)
router.post(
  '/',
  (req, res, next) => {
    // Authentication is optional for viewing stories; if token exists, authenticate, otherwise continue
    if (req.headers.authorization) {
      return authenticate(req as any, res, next);
    }
    return next();
  },
  [
    body('title').trim().notEmpty().isLength({ max: 500 }),
    body('content').trim().notEmpty(),
    body('category').optional().trim(),
  ],
  async (req: Request, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, excerpt, category, tags, featured_image_url } = req.body;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const result = await query(
        `INSERT INTO stories (author_id, title, slug, content, excerpt, category, tags, featured_image_url, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published', NOW())
         RETURNING *`,
        [req.user!.id, title, slug, content, excerpt, category, tags, featured_image_url]
      );

      const story = result.rows[0];

      // Process hashtags from content
      await processHashtags(story.id, content);

      res.status(201).json({
        success: true,
        data: { story },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload story featured image
router.post('/:id/image', authenticate, upload.single('image'), async (req: Request, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { id } = req.params;
    const { mimetype, buffer } = req.file;

    // Check if story belongs to user
    const storyCheck = await query(
      'SELECT author_id FROM stories WHERE id = $1',
      [id]
    );

    if (storyCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    if (storyCheck.rows[0].author_id !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Update story's featured image
    const result = await query(
      `UPDATE stories SET featured_image_data = $1, featured_image_mime_type = $2, featured_image_url = $3
       WHERE id = $4 RETURNING id, title, slug`,
      [buffer, mimetype, `/api/images/story/${id}`, id]
    );

    res.json({
      success: true,
      data: {
        story: result.rows[0],
        imageUrl: `/api/images/story/${id}`
      }
    });
  } catch (error) {
    next(error);
  }
});

// Like a story
router.post('/:id/like', authenticate, async (req: Request, res, next) => {
  try {
    const { id } = req.params;

    // Check if story exists
    const storyCheck = await query('SELECT id FROM stories WHERE id = $1', [id]);
    if (storyCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    // Add like (ON CONFLICT DO NOTHING prevents duplicates)
    const result = await query(
      'INSERT INTO likes (user_id, story_id) VALUES ($1, $2) ON CONFLICT (user_id, story_id) DO NOTHING RETURNING *',
      [req.user!.id, id]
    );

    // Create notification if this is a new like
    if (result.rows.length > 0) {
      await createLikeNotification(id, req.user!.id);
    }

    res.json({ success: true, message: 'Story liked' });
  } catch (error) {
    next(error);
  }
});

// Unlike a story
router.delete('/:id/like', authenticate, async (req: Request, res, next) => {
  try {
    const { id } = req.params;

    await query(
      'DELETE FROM likes WHERE user_id = $1 AND story_id = $2',
      [req.user!.id, id]
    );

    res.json({ success: true, message: 'Story unliked' });
  } catch (error) {
    next(error);
  }
});

// Check if user has liked a story
router.get('/:id/like/check', authenticate, async (req: Request, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id FROM likes WHERE user_id = $1 AND story_id = $2',
      [req.user!.id, id]
    );

    res.json({
      success: true,
      data: { is_liked: result.rows.length > 0 }
    });
  } catch (error) {
    next(error);
  }
});

// Delete a story (owner only)
router.delete('/:id', authenticate, async (req: Request, res, next) => {
  try {
    const { id } = req.params;

    // Check if story exists and belongs to user
    const storyCheck = await query(
      'SELECT author_id FROM stories WHERE id = $1',
      [id]
    );

    if (storyCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    if (storyCheck.rows[0].author_id !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You can only delete your own posts' });
    }

    // Delete the story (CASCADE will handle related records)
    await query('DELETE FROM stories WHERE id = $1', [id]);

    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
