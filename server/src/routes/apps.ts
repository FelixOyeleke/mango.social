import express from 'express';
import { query } from '../db/connection.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all available apps
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, description, icon, category, is_core, is_active, sort_order
       FROM apps
       WHERE is_active = true
       ORDER BY sort_order ASC, name ASC`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's app preferences
router.get('/preferences', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT 
        a.id,
        a.name,
        a.description,
        a.icon,
        a.category,
        a.is_core,
        a.sort_order,
        COALESCE(uap.is_enabled, false) as is_enabled
       FROM apps a
       LEFT JOIN user_app_preferences uap ON a.id = uap.app_id AND uap.user_id = $1
       WHERE a.is_active = true
       ORDER BY a.sort_order ASC, a.name ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// Update user's app preference (enable/disable a single app)
router.put('/preferences/:appId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { appId } = req.params;
    const { is_enabled } = req.body;

    if (typeof is_enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_enabled must be a boolean',
      });
    }

    // Check if app exists and is not core
    const appCheck = await query(
      'SELECT id, is_core FROM apps WHERE id = $1',
      [appId]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      });
    }

    if (appCheck.rows[0].is_core && !is_enabled) {
      return res.status(400).json({
        success: false,
        error: 'Cannot disable core apps',
      });
    }

    // Upsert preference
    const result = await query(
      `INSERT INTO user_app_preferences (user_id, app_id, is_enabled)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, app_id)
       DO UPDATE SET is_enabled = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, appId, is_enabled]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// Bulk update user's app preferences
router.put('/preferences', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        error: 'preferences must be an array',
      });
    }

    // Validate all apps exist and none are core apps being disabled
    const appIds = preferences.map(p => p.app_id);
    const appsCheck = await query(
      'SELECT id, is_core FROM apps WHERE id = ANY($1)',
      [appIds]
    );

    const appsMap = new Map(appsCheck.rows.map(app => [app.id, app]));

    for (const pref of preferences) {
      const app = appsMap.get(pref.app_id);
      if (!app) {
        return res.status(404).json({
          success: false,
          error: `App not found: ${pref.app_id}`,
        });
      }
      if (app.is_core && !pref.is_enabled) {
        return res.status(400).json({
          success: false,
          error: `Cannot disable core app: ${pref.app_id}`,
        });
      }
    }

    // Update all preferences
    const values = preferences.map((pref, index) => 
      `($1, $${index * 2 + 2}, $${index * 2 + 3})`
    ).join(', ');

    const params = [userId];
    preferences.forEach(pref => {
      params.push(pref.app_id, pref.is_enabled);
    });

    await query(
      `INSERT INTO user_app_preferences (user_id, app_id, is_enabled)
       VALUES ${values}
       ON CONFLICT (user_id, app_id)
       DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = CURRENT_TIMESTAMP`,
      params
    );

    // Return updated preferences
    const result = await query(
      `SELECT 
        a.id,
        a.name,
        a.description,
        a.icon,
        a.category,
        a.is_core,
        a.sort_order,
        COALESCE(uap.is_enabled, false) as is_enabled
       FROM apps a
       LEFT JOIN user_app_preferences uap ON a.id = uap.app_id AND uap.user_id = $1
       WHERE a.is_active = true
       ORDER BY a.sort_order ASC, a.name ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

