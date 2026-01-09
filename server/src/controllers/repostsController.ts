import { Response } from 'express';
import { query } from '../db/connection.js';
import { AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { createRepostNotification } from './notificationsController.js';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveStoryId(identifier: string): Promise<string> {
  // Try direct UUID
  if (uuidRegex.test(identifier)) {
    const exists = await query('SELECT id FROM stories WHERE id = $1', [identifier]);
    if (exists.rows.length > 0) return identifier;
  }

  // Try slug lookup
  const bySlug = await query('SELECT id FROM stories WHERE slug = $1', [identifier]);
  if (bySlug.rows.length > 0) return bySlug.rows[0].id;

  throw createError('Story not found', 404);
}

// Repost a story
export const repostStory = async (req: AuthRequest, res: Response) => {
  try {
    const { story_id: rawStoryId, comment } = req.body;
    const story_id = await resolveStoryId(rawStoryId);

    // Check if story exists
    const storyCheck = await query(`
      SELECT id, author_id FROM stories WHERE id = $1
    `, [story_id]);

    if (storyCheck.rows.length === 0) {
      throw createError('Story not found', 404);
    }

    // Check if user already reposted this story
    const existingRepost = await query(`
      SELECT id FROM reposts WHERE user_id = $1 AND story_id = $2
    `, [req.user!.id, story_id]);

    if (existingRepost.rows.length > 0) {
      throw createError('You have already reposted this story', 400);
    }

    // Create repost story entry
    const repostStory = await query(`
      INSERT INTO stories (
        title, content, excerpt, author_id, category, 
        is_repost, original_story_id, repost_comment, published_at
      )
      SELECT 
        title, content, excerpt, $1, category,
        true, id, $2, CURRENT_TIMESTAMP
      FROM stories
      WHERE id = $3
      RETURNING id
    `, [req.user!.id, comment || null, story_id]);

    // Create repost tracking entry
    await query(`
      INSERT INTO reposts (user_id, story_id, repost_story_id, comment)
      VALUES ($1, $2, $3, $4)
    `, [req.user!.id, story_id, repostStory.rows[0].id, comment || null]);

    // Create notification for original story author
    await createRepostNotification(story_id, req.user!.id);

    // Get the full repost with original story details
    const result = await query(`
      SELECT
        s.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        os.title as original_title,
        os.author_id as original_author_id,
        ou.full_name as original_author_name,
        ou.avatar_url as original_author_avatar
      FROM stories s
      JOIN users u ON s.author_id = u.id
      LEFT JOIN stories os ON s.original_story_id = os.id
      LEFT JOIN users ou ON os.author_id = ou.id
      WHERE s.id = $1
    `, [repostStory.rows[0].id]);

    res.status(201).json({
      success: true,
      data: { repost: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Undo repost
export const undoRepost = async (req: AuthRequest, res: Response) => {
  try {
    const { story_id: rawStoryId } = req.params;
    const story_id = await resolveStoryId(rawStoryId);

    // Find the repost
    const repost = await query(`
      SELECT id, repost_story_id FROM reposts 
      WHERE user_id = $1 AND story_id = $2
    `, [req.user!.id, story_id]);

    if (repost.rows.length === 0) {
      throw createError('Repost not found', 404);
    }

    // Delete the repost story
    await query(`
      DELETE FROM stories WHERE id = $1
    `, [repost.rows[0].repost_story_id]);

    // Delete the repost tracking (will be cascaded, but explicit is better)
    await query(`
      DELETE FROM reposts WHERE id = $1
    `, [repost.rows[0].id]);

    res.json({
      success: true,
      message: 'Repost removed successfully'
    });
  } catch (error) {
    throw error;
  }
};

// Get users who reposted a story
export const getReposters = async (req: AuthRequest, res: Response) => {
  try {
    const { story_id: rawStoryId } = req.params;
    const story_id = await resolveStoryId(rawStoryId);

    const result = await query(`
      SELECT 
        u.id,
        u.full_name,
        u.avatar_url,
        u.bio,
        r.comment,
        r.created_at
      FROM reposts r
      JOIN users u ON r.user_id = u.id
      WHERE r.story_id = $1
      ORDER BY r.created_at DESC
    `, [story_id]);

    res.json({
      success: true,
      data: { reposters: result.rows }
    });
  } catch (error) {
    throw error;
  }
};

// Check if user has reposted a story
export const checkRepost = async (req: AuthRequest, res: Response) => {
  try {
    const { story_id: rawStoryId } = req.params;
    const story_id = await resolveStoryId(rawStoryId);

    const result = await query(`
      SELECT id FROM reposts 
      WHERE user_id = $1 AND story_id = $2
    `, [req.user!.id, story_id]);

    res.json({
      success: true,
      data: { has_reposted: result.rows.length > 0 }
    });
  } catch (error) {
    throw error;
  }
};
