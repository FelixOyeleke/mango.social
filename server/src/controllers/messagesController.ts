import { Request, Response } from 'express';
import { query } from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';

// Get user's conversations
export const getConversations = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        c.id,
        c.title,
        c.is_group,
        c.created_at,
        c.updated_at,
        (
          SELECT json_agg(json_build_object(
            'id', u.id,
            'full_name', u.full_name,
            'avatar_url', u.avatar_url,
            'email', u.email
          ))
          FROM conversation_participants cp
          JOIN users u ON cp.user_id = u.id
          WHERE cp.conversation_id = c.id AND cp.user_id != $1
        ) as participants,
        (
          SELECT json_build_object(
            'id', m.id,
            'content', m.content,
            'sender_id', m.sender_id,
            'sender_name', u.full_name,
            'created_at', m.created_at,
            'is_read', m.is_read
          )
          FROM messages m
          JOIN users u ON m.sender_id = u.id
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*)::int
          FROM messages m
          WHERE m.conversation_id = c.id 
          AND m.sender_id != $1
          AND m.created_at > (
            SELECT last_read_at 
            FROM conversation_participants 
            WHERE conversation_id = c.id AND user_id = $1
          )
        ) as unread_count
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC
    `, [req.user!.id]);

    res.json({
      success: true,
      data: { conversations: result.rows }
    });
  } catch (error) {
    throw error;
  }
};

// Get or create conversation with a user
export const getOrCreateConversation = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { user_id } = req.body;

    if (user_id === req.user!.id) {
      throw createError('Cannot create conversation with yourself', 400);
    }

    // Check if conversation already exists
    const existingConv = await query(`
      SELECT c.id
      FROM conversations c
      JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
      JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
      WHERE c.is_group = false
      AND cp1.user_id = $1
      AND cp2.user_id = $2
      AND (
        SELECT COUNT(*) FROM conversation_participants
        WHERE conversation_id = c.id
      ) = 2
    `, [req.user!.id, user_id]);

    if (existingConv.rows.length > 0) {
      // Return existing conversation
      const convId = existingConv.rows[0].id;
      const conversation = await getConversationById(convId, req.user!.id);
      return res.json({
        success: true,
        data: { conversation }
      });
    }

    // Create new conversation
    const newConv = await query(`
      INSERT INTO conversations (created_by, is_group)
      VALUES ($1, false)
      RETURNING *
    `, [req.user!.id]);

    const conversationId = newConv.rows[0].id;

    // Add both participants
    await query(`
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES ($1, $2), ($1, $3)
    `, [conversationId, req.user!.id, user_id]);

    const conversation = await getConversationById(conversationId, req.user!.id);

    return res.status(201).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    throw error;
  }
};

// Get messages in a conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversation_id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Verify user is participant
    const participant = await query(`
      SELECT id FROM conversation_participants
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversation_id, req.user!.id]);

    if (participant.rows.length === 0) {
      throw createError('Not a participant of this conversation', 403);
    }

    const result = await query(`
      SELECT 
        m.*,
        u.full_name as sender_name,
        u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1 AND m.is_deleted = false
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [conversation_id, limit, offset]);

    // Update last_read_at
    await query(`
      UPDATE conversation_participants
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversation_id, req.user!.id]);

    res.json({
      success: true,
      data: { messages: result.rows.reverse() }
    });
  } catch (error) {
    throw error;
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversation_id, content, message_type = 'text', attachment_url } = req.body;

    // Verify user is participant
    const participant = await query(`
      SELECT id FROM conversation_participants
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversation_id, req.user!.id]);

    if (participant.rows.length === 0) {
      throw createError('Not a participant of this conversation', 403);
    }

    const result = await query(`
      INSERT INTO messages (conversation_id, sender_id, content, message_type, attachment_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [conversation_id, req.user!.id, content, message_type, attachment_url]);

    const message = await query(`
      SELECT
        m.*,
        u.full_name as sender_name,
        u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = $1
    `, [result.rows[0].id]);

    res.status(201).json({
      success: true,
      data: { message: message.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify user owns the message
    const message = await query(`
      SELECT sender_id FROM messages WHERE id = $1
    `, [id]);

    if (message.rows.length === 0) {
      throw createError('Message not found', 404);
    }

    if (message.rows[0].sender_id !== req.user!.id) {
      throw createError('Unauthorized', 403);
    }

    await query(`
      UPDATE messages SET is_deleted = true WHERE id = $1
    `, [id]);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    throw error;
  }
};

// Mark conversation as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { conversation_id } = req.params;

    await query(`
      UPDATE conversation_participants
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversation_id, req.user!.id]);

    res.json({
      success: true,
      message: 'Marked as read'
    });
  } catch (error) {
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT COUNT(DISTINCT m.conversation_id)::int as unread_conversations
      FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = $1
      AND m.sender_id != $1
      AND m.created_at > cp.last_read_at
      AND m.is_deleted = false
    `, [req.user!.id]);

    res.json({
      success: true,
      data: { unread_count: result.rows[0].unread_conversations }
    });
  } catch (error) {
    throw error;
  }
};

// Helper function to get conversation by ID
async function getConversationById(conversationId: string, _userId: string) {
  const result = await query(`
    SELECT
      c.*,
      (
        SELECT json_agg(json_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'avatar_url', u.avatar_url
        ))
        FROM conversation_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = c.id
      ) as participants
    FROM conversations c
    WHERE c.id = $1
  `, [conversationId]);

  return result.rows[0];
}
