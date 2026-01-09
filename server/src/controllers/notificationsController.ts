import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query } from '../db/connection.js';

// Get user's notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unread_only === 'true';

    let queryText = `
      SELECT 
        n.*,
        actor.full_name as actor_name,
        actor.avatar_url as actor_avatar,
        s.title as story_title,
        s.slug as story_slug,
        c.content as comment_content
      FROM notifications n
      LEFT JOIN users actor ON n.actor_id = actor.id
      LEFT JOIN stories s ON n.story_id = s.id
      LEFT JOIN comments c ON n.comment_id = c.id
      WHERE n.user_id = $1
    `;

    const params: any[] = [req.user!.id];

    if (unreadOnly) {
      queryText += ` AND n.is_read = false`;
    }

    queryText += ` ORDER BY n.created_at DESC LIMIT $2 OFFSET $3`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: { notifications: result.rows }
    });
  } catch (error) {
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user!.id]
    );

    res.json({
      success: true,
      data: { count: parseInt(result.rows[0].count) }
    });
  } catch (error) {
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.user!.id]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS TO CREATE NOTIFICATIONS
// ============================================

export const createNotification = async (
  userId: string,
  type: string,
  actorId: string,
  storyId?: string,
  commentId?: string
) => {
  // Don't notify users about their own actions
  if (userId === actorId) return;

  try {
    await query(
      `INSERT INTO notifications (user_id, type, actor_id, story_id, comment_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, actorId, storyId || null, commentId || null]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const createLikeNotification = async (storyId: string, actorId: string) => {
  const story = await query('SELECT author_id FROM stories WHERE id = $1', [storyId]);
  if (story.rows.length > 0) {
    await createNotification(story.rows[0].author_id, 'like', actorId, storyId);
  }
};

export const createCommentNotification = async (storyId: string, commentId: string, actorId: string) => {
  const story = await query('SELECT author_id FROM stories WHERE id = $1', [storyId]);
  if (story.rows.length > 0) {
    await createNotification(story.rows[0].author_id, 'comment', actorId, storyId, commentId);
  }
};

export const createRepostNotification = async (storyId: string, actorId: string) => {
  const story = await query('SELECT author_id FROM stories WHERE id = $1', [storyId]);
  if (story.rows.length > 0) {
    await createNotification(story.rows[0].author_id, 'repost', actorId, storyId);
  }
};

