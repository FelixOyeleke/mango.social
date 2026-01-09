import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db/connection.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createCommentNotification } from '../controllers/notificationsController.js';

const router = express.Router();

// Get comments for a story
router.get('/story/:storyId', async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const result = await query(
      `SELECT c.*, u.full_name as user_name, u.avatar_url as user_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.story_id = $1 AND c.is_approved = true
       ORDER BY c.created_at DESC`,
      [storyId]
    );

    res.json({ success: true, data: { comments: result.rows } });
  } catch (error) {
    next(error);
  }
});

// Get comments created by a user (their replies)
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    let result;
    try {
      result = await query(
        `SELECT c.id, c.content, c.created_at, c.story_id, c.parent_id,
                s.slug as story_slug, s.title as story_title
         FROM comments c
         JOIN stories s ON c.story_id = s.id
         WHERE c.user_id = $1 AND c.is_approved = true
         ORDER BY c.created_at DESC`,
        [userId]
      );
    } catch (error: any) {
      if (error.message?.includes('is_approved')) {
        // If is_approved column doesn't exist, ignore that filter
        result = await query(
          `SELECT c.id, c.content, c.created_at, c.story_id, c.parent_id,
                  s.slug as story_slug, s.title as story_title
           FROM comments c
           JOIN stories s ON c.story_id = s.id
           WHERE c.user_id = $1
           ORDER BY c.created_at DESC`,
          [userId]
        );
      } else {
        throw error;
      }
    }

    res.json({ success: true, data: { comments: result.rows } });
  } catch (error) {
    next(error);
  }
});

// Create comment
router.post(
  '/',
  authenticate,
  [body('story_id').isUUID(), body('content').trim().notEmpty()],
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { story_id, content, parent_id } = req.body;

      const result = await query(
        'INSERT INTO comments (story_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [story_id, req.user!.id, content, parent_id || null]
      );

      const comment = result.rows[0];

      // Create notification for story author
      await createCommentNotification(story_id, comment.id, req.user!.id);

      res.status(201).json({ success: true, data: { comment } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
