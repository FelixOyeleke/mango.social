import express from 'express';
import { query } from '../db/connection.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get user bookmarks
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      `SELECT s.*, u.full_name as author_name, b.created_at as bookmarked_at
       FROM bookmarks b
       JOIN stories s ON b.story_id = s.id
       JOIN users u ON s.author_id = u.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user!.id]
    );

    res.json({ success: true, data: { bookmarks: result.rows } });
  } catch (error) {
    next(error);
  }
});

// Add bookmark
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { story_id } = req.body;
    await query(
      'INSERT INTO bookmarks (user_id, story_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user!.id, story_id]
    );

    res.status(201).json({ success: true, message: 'Bookmark added' });
  } catch (error) {
    next(error);
  }
});

// Remove bookmark
router.delete('/:storyId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { storyId } = req.params;
    await query('DELETE FROM bookmarks WHERE user_id = $1 AND story_id = $2', [req.user!.id, storyId]);

    res.json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    next(error);
  }
});

export default router;

