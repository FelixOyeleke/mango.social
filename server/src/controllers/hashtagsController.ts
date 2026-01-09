import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query } from '../db/connection.js';
import { getTrendingHashtags, searchHashtags } from '../utils/hashtagParser.js';

// Get trending hashtags
export const getTrending = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const hashtags = await getTrendingHashtags(limit);
    
    res.json({
      success: true,
      data: { hashtags }
    });
  } catch (error) {
    throw error;
  }
};

// Search hashtags
export const search = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const hashtags = await searchHashtags(q, limit);
    
    res.json({
      success: true,
      data: { hashtags }
    });
  } catch (error) {
    throw error;
  }
};

// Get stories by hashtag
export const getStoriesByHashtag = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const userId = req.user?.id;
    
    const result = await query(
      `SELECT 
        s.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comments_count,
        (SELECT COUNT(*) FROM reposts WHERE story_id = s.id) as reposts_count,
        ${userId ? `EXISTS(SELECT 1 FROM likes WHERE story_id = s.id AND user_id = $4) as is_liked_by_user,` : 'false as is_liked_by_user,'}
        ${userId ? `EXISTS(SELECT 1 FROM bookmarks WHERE story_id = s.id AND user_id = $4) as is_bookmarked_by_user,` : 'false as is_bookmarked_by_user,'}
        ${userId ? `EXISTS(SELECT 1 FROM reposts WHERE story_id = s.id AND user_id = $4) as is_reposted_by_user` : 'false as is_reposted_by_user'}
      FROM stories s
      JOIN users u ON s.author_id = u.id
      JOIN story_hashtags sh ON s.id = sh.story_id
      JOIN hashtags h ON sh.hashtag_id = h.id
      WHERE h.name = $1 AND s.status = 'published'
      ORDER BY s.published_at DESC
      LIMIT $2 OFFSET $3`,
      userId ? [name.toLowerCase(), limit, offset, userId] : [name.toLowerCase(), limit, offset]
    );
    
    res.json({
      success: true,
      data: { stories: result.rows }
    });
  } catch (error) {
    throw error;
  }
};

// Get hashtag details
export const getHashtagDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.params;
    
    const result = await query(
      `SELECT * FROM hashtags WHERE name = $1`,
      [name.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Hashtag not found'
      });
    }
    
    res.json({
      success: true,
      data: { hashtag: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

