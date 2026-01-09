import { Response, NextFunction } from 'express';
import { query } from '../db/connection.js';
import { AuthRequest } from '../middleware/auth.js';

// Join waitlist (public endpoint)
export const joinWaitlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, full_name, reason, interest_area, referral_source } = req.body;

    // Check if email already exists
    const existingEntry = await query(
      'SELECT id FROM waitlist WHERE email = $1',
      [email]
    );

    if (existingEntry.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'This email is already on the waitlist'
      });
    }

    // Add to waitlist
    const result = await query(
      `INSERT INTO waitlist (email, full_name, reason, interest_area, referral_source)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, full_name, reason, interest_area, referral_source]
    );

    res.status(201).json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get all waitlist entries (admin only)
export const getWaitlistEntries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM waitlist';
    const queryParams: any[] = [];

    if (status) {
      queryText += ' WHERE status = $1';
      queryParams.push(status);
    }

    queryText += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count
    const countQuery = status 
      ? 'SELECT COUNT(*) FROM waitlist WHERE status = $1'
      : 'SELECT COUNT(*) FROM waitlist';
    const countParams = status ? [status] : [];
    const countResult = await query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        entries: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get public waitlist count
export const getPublicWaitlistCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await query(`
      SELECT COUNT(*) as total
      FROM waitlist
    `);

    res.json({
      success: true,
      data: { total: stats.rows[0].total }
    });
  } catch (error) {
    next(error);
  }
};

// Get waitlist stats (admin only)
export const getWaitlistStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'invited') as invited,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
      FROM waitlist
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update waitlist entry status (admin only)
export const updateWaitlistEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (status) {
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(status);
      paramCount++;

      // If status is 'invited', set invited_at timestamp
      if (status === 'invited') {
        updateFields.push(`invited_at = CURRENT_TIMESTAMP`);
      }
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      updateValues.push(notes);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateValues.push(id);

    const result = await query(
      `UPDATE waitlist 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Waitlist entry not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

