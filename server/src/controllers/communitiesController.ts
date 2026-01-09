import { Response } from 'express';
import { query } from '../db/connection.js';
import { AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

// Get all communities
export const getCommunities = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        c.*,
        u.full_name as creator_name,
        (
          SELECT COUNT(*)::int 
          FROM community_members cm 
          WHERE cm.community_id = c.id AND cm.user_id = $1
        ) > 0 as is_member
      FROM communities c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.member_count DESC
    `, [req.user?.id || null]);

    res.json({
      success: true,
      data: { communities: result.rows }
    });
  } catch (error) {
    throw error;
  }
};

// Get single community
export const getCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await query(`
      SELECT 
        c.*,
        u.full_name as creator_name,
        u.avatar_url as creator_avatar,
        (
          SELECT COUNT(*)::int 
          FROM community_members cm 
          WHERE cm.community_id = c.id AND cm.user_id = $1
        ) > 0 as is_member,
        (
          SELECT role 
          FROM community_members cm 
          WHERE cm.community_id = c.id AND cm.user_id = $1
        ) as user_role
      FROM communities c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.slug = $2
    `, [req.user?.id || null, slug]);

    if (result.rows.length === 0) {
      throw createError('Community not found', 404);
    }

    res.json({
      success: true,
      data: { community: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Create community
export const createCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, is_private, rules } = req.body;

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check if slug already exists
    const existing = await query(`
      SELECT id FROM communities WHERE slug = $1
    `, [slug]);

    if (existing.rows.length > 0) {
      throw createError('A community with this name already exists', 400);
    }

    const result = await query(`
      INSERT INTO communities (name, slug, description, created_by, is_private, rules)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, slug, description, req.user!.id, is_private || false, rules || null]);

    const communityId = result.rows[0].id;

    // Add creator as admin member
    await query(`
      INSERT INTO community_members (community_id, user_id, role)
      VALUES ($1, $2, 'admin')
    `, [communityId, req.user!.id]);

    res.status(201).json({
      success: true,
      data: { community: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Join community
export const joinCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if community exists
    const community = await query(`
      SELECT id, is_private FROM communities WHERE id = $1
    `, [id]);

    if (community.rows.length === 0) {
      throw createError('Community not found', 404);
    }

    if (community.rows[0].is_private) {
      throw createError('This is a private community', 403);
    }

    // Check if already a member
    const existing = await query(`
      SELECT id FROM community_members 
      WHERE community_id = $1 AND user_id = $2
    `, [id, req.user!.id]);

    if (existing.rows.length > 0) {
      throw createError('Already a member of this community', 400);
    }

    await query(`
      INSERT INTO community_members (community_id, user_id)
      VALUES ($1, $2)
    `, [id, req.user!.id]);

    res.json({
      success: true,
      message: 'Successfully joined community'
    });
  } catch (error) {
    throw error;
  }
};

// Leave community
export const leaveCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM community_members 
      WHERE community_id = $1 AND user_id = $2
      RETURNING id
    `, [id, req.user!.id]);

    if (result.rows.length === 0) {
      throw createError('Not a member of this community', 400);
    }

    res.json({
      success: true,
      message: 'Successfully left community'
    });
  } catch (error) {
    throw error;
  }
};

