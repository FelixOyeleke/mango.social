import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query } from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';

// Get dashboard statistics
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Helper function to safely count from a table
    const safeCount = async (tableName: string, condition: string = '') => {
      try {
        const whereClause = condition ? `WHERE ${condition}` : '';
        const result = await query(`SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`);
        return result;
      } catch (error) {
        console.log(`Table ${tableName} might not exist, returning 0`);
        return { rows: [{ count: '0' }] };
      }
    };

    // Get overall statistics
    const [
      totalUsers,
      totalStories,
      totalComments,
      totalJobs,
      totalCommunities,
      totalMessages
    ] = await Promise.all([
      safeCount('users'),
      safeCount('stories'),
      safeCount('comments'),
      safeCount('jobs'),
      safeCount('communities'),
      safeCount('messages')
    ]);

    // Get active users (users who have posted or commented in the last 30 days)
    let activeUsers;
    try {
      activeUsers = await query(`
        SELECT COUNT(DISTINCT user_id) as count FROM (
          SELECT author_id as user_id FROM stories WHERE created_at > NOW() - INTERVAL '30 days'
          UNION
          SELECT user_id FROM comments WHERE created_at > NOW() - INTERVAL '30 days'
        ) as active
      `);
    } catch (error) {
      console.log('Error fetching active users:', error);
      activeUsers = { rows: [{ count: '0' }] };
    }

    // Get recent activity (last 7 days)
    let recentActivity;
    try {
      recentActivity = await query(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM (
          SELECT created_at FROM users WHERE created_at > NOW() - INTERVAL '7 days'
          UNION ALL
          SELECT created_at FROM stories WHERE created_at > NOW() - INTERVAL '7 days'
          UNION ALL
          SELECT created_at FROM comments WHERE created_at > NOW() - INTERVAL '7 days'
        ) as activities
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);
    } catch (error) {
      console.log('Error fetching recent activity:', error);
      recentActivity = { rows: [] };
    }

    // Get top contributors
    let topContributors;
    try {
      topContributors = await query(`
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.avatar_url,
          COUNT(DISTINCT s.id) as story_count,
          COUNT(DISTINCT c.id) as comment_count,
          COUNT(DISTINCT l.id) as likes_received
        FROM users u
        LEFT JOIN stories s ON u.id = s.author_id
        LEFT JOIN comments c ON u.id = c.user_id
        LEFT JOIN likes l ON s.id = l.story_id
        WHERE u.is_active = true
        GROUP BY u.id, u.full_name, u.email, u.avatar_url
        ORDER BY story_count DESC, comment_count DESC
        LIMIT 10
      `);
    } catch (error) {
      console.log('Error fetching top contributors:', error);
      topContributors = { rows: [] };
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: parseInt(totalUsers.rows[0].count),
          activeUsers: parseInt(activeUsers.rows[0].count),
          totalStories: parseInt(totalStories.rows[0].count),
          totalComments: parseInt(totalComments.rows[0].count),
          totalJobs: parseInt(totalJobs.rows[0].count),
          totalCommunities: parseInt(totalCommunities.rows[0].count),
          totalMessages: parseInt(totalMessages.rows[0].count)
        },
        recentActivity: recentActivity.rows,
        topContributors: topContributors.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all users with pagination and filters
export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const role = req.query.role as string || '';
    const status = req.query.status as string || '';
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(LOWER(full_name) LIKE LOWER($${paramIndex}) OR LOWER(email) LIKE LOWER($${paramIndex}))`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (status === 'active') {
      whereConditions.push('is_active = true');
    } else if (status === 'inactive') {
      whereConditions.push('is_active = false');
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );

    // Get users with stats
    let usersResult;
    try {
      usersResult = await query(
        `SELECT 
          u.id,
          u.email,
          u.full_name,
          u.username,
          u.avatar_url,
          u.role,
          u.is_active,
          u.email_verified,
          u.created_at,
          COUNT(DISTINCT s.id) as story_count,
          COUNT(DISTINCT c.id) as comment_count,
          COUNT(DISTINCT l.id) as likes_given
        FROM users u
        LEFT JOIN stories s ON u.id = s.author_id
        LEFT JOIN comments c ON u.id = c.user_id
        LEFT JOIN likes l ON u.id = l.user_id
        ${whereClause}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );
    } catch (error: any) {
      // Fallback for databases without username column yet
      if (error.message?.includes('username')) {
        usersResult = await query(
          `SELECT 
            u.id,
            u.email,
            u.full_name,
            NULL as username,
            u.avatar_url,
            u.role,
            u.is_active,
            u.email_verified,
            u.created_at,
            COUNT(DISTINCT s.id) as story_count,
            COUNT(DISTINCT c.id) as comment_count,
            COUNT(DISTINCT l.id) as likes_given
          FROM users u
          LEFT JOIN stories s ON u.id = s.author_id
          LEFT JOIN comments c ON u.id = c.user_id
          LEFT JOIN likes l ON u.id = l.user_id
          ${whereClause}
          GROUP BY u.id
          ORDER BY u.created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
          [...params, limit, offset]
        );
      } else {
        throw error;
      }
    }

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].count),
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single user details
export const getUserDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const userResult = await query(
      `SELECT
        u.*,
        COUNT(DISTINCT s.id) as story_count,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT l.id) as likes_given,
        COUNT(DISTINCT lr.id) as likes_received,
        COUNT(DISTINCT b.id) as bookmarks_count,
        COUNT(DISTINCT ja.id) as job_applications_count
      FROM users u
      LEFT JOIN stories s ON u.id = s.author_id
      LEFT JOIN comments c ON u.id = c.user_id
      LEFT JOIN likes l ON u.id = l.user_id
      LEFT JOIN stories us ON u.id = us.author_id
      LEFT JOIN likes lr ON us.id = lr.story_id
      LEFT JOIN bookmarks b ON u.id = b.user_id
      LEFT JOIN job_applications ja ON u.id = ja.user_id
      WHERE u.id = $1
      GROUP BY u.id`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw createError('User not found', 404);
    }

    // Get user's recent stories
    const recentStories = await query(
      `SELECT id, title, status, views_count, created_at
       FROM stories
       WHERE author_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Get user's recent comments
    const recentComments = await query(
      `SELECT c.id, c.content, c.created_at, s.title as story_title
       FROM comments c
       JOIN stories s ON c.story_id = s.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: userResult.rows[0],
        recentStories: recentStories.rows,
        recentComments: recentComments.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin)
export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { role, is_active, email_verified } = req.body;

    const result = await query(
      `UPDATE users
       SET role = COALESCE($1, role),
           is_active = COALESCE($2, is_active),
           email_verified = COALESCE($3, email_verified),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, full_name, role, is_active, email_verified`,
      [role, is_active, email_verified, userId]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Block/Unblock user (admin)
export const blockUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { is_blocked, block_reason } = req.body;

    // Prevent blocking yourself
    if (userId === req.user!.id) {
      throw createError('Cannot block your own account', 400);
    }

    const result = await query(
      `UPDATE users
       SET is_active = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, full_name, is_active`,
      [!is_blocked, userId]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404);
    }

    // Log the block action
    await query(
      `INSERT INTO admin_actions (admin_id, action_type, target_user_id, reason, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT DO NOTHING`,
      [req.user!.id, is_blocked ? 'block' : 'unblock', userId, block_reason || null]
    ).catch(() => {
      // Table might not exist, ignore error
      console.log('Admin actions table not found, skipping log');
    });

    res.json({
      success: true,
      data: {
        user: result.rows[0],
        action: is_blocked ? 'blocked' : 'unblocked'
      },
      message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Suspend user temporarily (admin)
export const suspendUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { suspend_until, reason } = req.body;

    // Prevent suspending yourself
    if (userId === req.user!.id) {
      throw createError('Cannot suspend your own account', 400);
    }

    const result = await query(
      `UPDATE users
       SET is_active = false,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, full_name, is_active`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0],
        suspend_until,
        reason
      },
      message: 'User suspended successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Send message to user (admin)
export const sendMessageToUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { message, subject } = req.body;

    if (!message) {
      throw createError('Message content is required', 400);
    }

    // Check if user exists
    const userCheck = await query(
      'SELECT id, email, full_name FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      throw createError('User not found', 404);
    }

    // Create or get conversation with user
    let conversationId;

    // Check if conversation already exists
    const existingConv = await query(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
       JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
       WHERE cp1.user_id = $1 AND cp2.user_id = $2
         AND c.is_group = false
       LIMIT 1`,
      [req.user!.id, userId]
    );

    if (existingConv.rows.length > 0) {
      conversationId = existingConv.rows[0].id;
    } else {
      // Create new conversation
      const newConv = await query(
        `INSERT INTO conversations (title, is_group, created_by, created_at)
         VALUES ($1, false, $2, CURRENT_TIMESTAMP)
         RETURNING id`,
        [subject || 'Admin Message', req.user!.id]
      );
      conversationId = newConv.rows[0].id;

      // Add participants
      await query(
        `INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP), ($1, $3, CURRENT_TIMESTAMP)`,
        [conversationId, req.user!.id, userId]
      );
    }

    // Send message
    const messageResult = await query(
      `INSERT INTO messages (conversation_id, sender_id, content, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id, content, created_at`,
      [conversationId, req.user!.id, message]
    );

    res.json({
      success: true,
      data: {
        message: messageResult.rows[0],
        conversation_id: conversationId,
        recipient: userCheck.rows[0]
      },
      message: 'Message sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin)
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { permanent } = req.body;

    // Prevent deleting yourself
    if (userId === req.user!.id) {
      throw createError('Cannot delete your own account', 400);
    }

    if (permanent) {
      // Permanent deletion
      await query('DELETE FROM users WHERE id = $1', [userId]);

      res.json({
        success: true,
        message: 'User permanently deleted'
      });
    } else {
      // Soft delete - just deactivate
      await query(
        `UPDATE users
         SET is_active = false,
             email = CONCAT('deleted_', id, '@deleted.com'),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [userId]
      );

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get all stories with filters
export const getStories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params: any[] = [];

    if (status) {
      whereClause = 'WHERE s.status = $1';
      params.push(status);
    }

    const countResult = await query(
      `SELECT COUNT(*) as count FROM stories s ${whereClause}`,
      params
    );

    const storiesResult = await query(
      `SELECT
        s.*,
        u.full_name as author_name,
        u.email as author_email,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count
      FROM stories s
      JOIN users u ON s.author_id = u.id
      LEFT JOIN likes l ON s.id = l.story_id
      LEFT JOIN comments c ON s.id = c.story_id
      ${whereClause}
      GROUP BY s.id, u.full_name, u.email
      ORDER BY s.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        stories: storiesResult.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].count),
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete story (admin)
export const deleteStory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { storyId } = req.params;

    await query('DELETE FROM stories WHERE id = $1', [storyId]);

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get recent activity
export const getRecentActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const activities = await query(
      `SELECT
        'user_registered' as type,
        u.id as user_id,
        u.full_name as user_name,
        u.email,
        u.created_at as timestamp
      FROM users u
      WHERE u.created_at > NOW() - INTERVAL '7 days'

      UNION ALL

      SELECT
        'story_created' as type,
        s.author_id as user_id,
        u.full_name as user_name,
        s.title as email,
        s.created_at as timestamp
      FROM stories s
      JOIN users u ON s.author_id = u.id
      WHERE s.created_at > NOW() - INTERVAL '7 days'

      UNION ALL

      SELECT
        'comment_posted' as type,
        c.user_id,
        u.full_name as user_name,
        s.title as email,
        c.created_at as timestamp
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN stories s ON c.story_id = s.id
      WHERE c.created_at > NOW() - INTERVAL '7 days'

      ORDER BY timestamp DESC
      LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: { activities: activities.rows }
    });
  } catch (error) {
    next(error);
  }
};
