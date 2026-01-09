import { Response } from 'express';
import { query } from '../db/connection.js';
import { AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveUserId(identifier: string): Promise<string> {
  // If it's a UUID, use it directly
  if (uuidRegex.test(identifier)) {
    const direct = await query('SELECT id FROM users WHERE id = $1', [identifier]);
    if (direct.rows.length > 0) {
      return identifier;
    }
  }

  // Otherwise, try to resolve by username or email
  try {
    const result = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $1 LIMIT 1',
      [identifier]
    );
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
  } catch (error: any) {
    // If username column does not exist, try email-only lookup
    if (error.message?.includes('username')) {
      const emailResult = await query(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [identifier]
      );
      if (emailResult.rows.length > 0) {
        return emailResult.rows[0].id;
      }
    } else {
      throw error;
    }
  }

  throw createError('User not found', 404);
}

// Follow a user
export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: rawUserId } = req.params;
    const followerId = req.user!.id;
    const userId = await resolveUserId(rawUserId);

    // Can't follow yourself
    if (userId === followerId) {
      throw createError('Cannot follow yourself', 400);
    }

    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      throw createError('User not found', 404);
    }

    // Check if already following
    const existingFollow = await query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, userId]
    );

    if (existingFollow.rows.length > 0) {
      throw createError('Already following this user', 400);
    }

    // Create follow relationship
    await query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
      [followerId, userId]
    );

    // Update follower counts
    await query(
      'UPDATE users SET following_count = following_count + 1 WHERE id = $1',
      [followerId]
    );
    await query(
      'UPDATE users SET followers_count = followers_count + 1 WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error) {
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: rawUserId } = req.params;
    const followerId = req.user!.id;
    const userId = await resolveUserId(rawUserId);

    const result = await query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING id',
      [followerId, userId]
    );

    if (result.rows.length === 0) {
      throw createError('Not following this user', 400);
    }

    // Update follower counts
    await query(
      'UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = $1',
      [followerId]
    );
    await query(
      'UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    throw error;
  }
};

// Check if following a user
export const checkFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: rawUserId } = req.params;
    const followerId = req.user!.id;
    const userId = await resolveUserId(rawUserId);

    const result = await query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, userId]
    );

    res.json({
      success: true,
      data: { isFollowing: result.rows.length > 0 }
    });
  } catch (error) {
    throw error;
  }
};

// Check mutual follow (both users follow each other)
export const checkMutualFollow = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: rawUserId } = req.params;
    const currentUserId = req.user!.id;
    const userId = await resolveUserId(rawUserId);

    const result = await query(
      `SELECT 
        EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2) as i_follow_them,
        EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = $1) as they_follow_me
      `,
      [currentUserId, userId]
    );

    const { i_follow_them, they_follow_me } = result.rows[0];
    const isMutual = i_follow_them && they_follow_me;

    res.json({
      success: true,
      data: {
        isFollowing: i_follow_them,
        isFollower: they_follow_me,
        isMutual
      }
    });
  } catch (error) {
    throw error;
  }
};

// Get user's followers
export const getFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: rawUserId } = req.params;
    const userId = await resolveUserId(rawUserId);

    let result;
    try {
      result = await query(
        `SELECT u.id, u.full_name, u.username, u.avatar_url, u.bio, f.created_at as followed_at
         FROM follows f
         JOIN users u ON f.follower_id = u.id
         WHERE f.following_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
      );
    } catch (error: any) {
      if (error.message?.includes('username')) {
        // Fallback without username column
        result = await query(
          `SELECT u.id, u.full_name, u.avatar_url, u.bio, f.created_at as followed_at
           FROM follows f
           JOIN users u ON f.follower_id = u.id
           WHERE f.following_id = $1
           ORDER BY f.created_at DESC`,
          [userId]
        );
      } else {
        throw error;
      }
    }

    res.json({
      success: true,
      data: { followers: result.rows }
    });
  } catch (error) {
    throw error;
  }
};

// Get users that a user is following
export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: rawUserId } = req.params;
    const userId = await resolveUserId(rawUserId);

    let result;
    try {
      result = await query(
        `SELECT u.id, u.full_name, u.username, u.avatar_url, u.bio, f.created_at as followed_at
         FROM follows f
         JOIN users u ON f.following_id = u.id
         WHERE f.follower_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
      );
    } catch (error: any) {
      if (error.message?.includes('username')) {
        result = await query(
          `SELECT u.id, u.full_name, u.avatar_url, u.bio, f.created_at as followed_at
           FROM follows f
           JOIN users u ON f.following_id = u.id
           WHERE f.follower_id = $1
           ORDER BY f.created_at DESC`,
          [userId]
        );
      } else {
        throw error;
      }
    }

    res.json({
      success: true,
      data: { following: result.rows }
    });
  } catch (error) {
    throw error;
  }
};
