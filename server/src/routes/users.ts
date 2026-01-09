import express from 'express';
import multer from 'multer';
import { query } from '../db/connection.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for avatar upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
  },
  fileFilter: (_req, file, cb): void => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Get user profile
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const baseFieldsWithUsername = `
  id, username, full_name, avatar_url, bio, country_of_origin, current_location, created_at,
  location, website, banner_url, twitter_handle, linkedin_url, visa_status,
  followers_count, following_count
`;

const baseFieldsNoUsername = `
  id, full_name, avatar_url, bio, country_of_origin, current_location, created_at,
  location, website, banner_url, twitter_handle, linkedin_url, visa_status,
  followers_count, following_count
`;

async function selectUser(selectClause: string, whereClause: string, value: string) {
  return query(
    `SELECT ${selectClause}
     FROM users
     WHERE ${whereClause}
     LIMIT 1`,
    [value]
  );
}

async function findUserByIdOrUsername(identifier: string) {
  // Try UUID with username column
  if (uuidRegex.test(identifier)) {
    try {
      const direct = await selectUser(baseFieldsWithUsername, 'id = $1', identifier);
      if (direct.rows.length > 0) return direct.rows[0];
    } catch (error: any) {
      if (!error.message?.includes('username')) throw error;
      const directNoUsername = await selectUser(baseFieldsNoUsername, 'id = $1', identifier);
      if (directNoUsername.rows.length > 0) return directNoUsername.rows[0];
    }
  }

  // Username/email lookup
  try {
    const result = await selectUser(baseFieldsWithUsername, 'username = $1 OR email = $1', identifier);
    if (result.rows.length > 0) return result.rows[0];
  } catch (error: any) {
    if (!error.message?.includes('username')) throw error;
    const emailResult = await selectUser(baseFieldsNoUsername, 'email = $1', identifier);
    if (emailResult.rows.length > 0) return emailResult.rows[0];
  }

  return null;
}

// Search users
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Search by full name, email, or bio
    const result = await query(
      `SELECT
        id, full_name, email, avatar_url, bio,
        followers_count, following_count
       FROM users
       WHERE (LOWER(full_name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1) OR LOWER(bio) LIKE LOWER($1))
       AND role != 'admin'
       ORDER BY followers_count DESC NULLS LAST, full_name ASC
       LIMIT $2`,
      [`%${q}%`, limit]
    );

    return res.json({
      success: true,
      data: { users: result.rows }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await findUserByIdOrUsername(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: { user } });
  } catch (error) {
    return next(error);
  }
});

// Update user profile
router.put('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    console.log('Update profile request from user:', req.user!.id);
    console.log('Request body:', req.body);

    const {
      username, full_name, bio, country_of_origin, current_location, avatar_url,
      location, website, banner_url, twitter_handle, linkedin_url,
      visa_status, city, country, country_code, latitude, longitude
    } = req.body;

    // Check if username column exists and if username is already taken (if provided)
    let hasUsernameColumn = true;
    if (username) {
      try {
        const existingUser = await query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [username, req.user!.id]
        );
        if (existingUser.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Username is already taken'
          });
        }
      } catch (error: any) {
        if (error.message?.includes('column') && error.message?.includes('username')) {
          hasUsernameColumn = false;
        } else {
          throw error;
        }
      }
    }

    // Update profile with or without username column
    let result;
    try {
      if (hasUsernameColumn) {
        result = await query(
          `UPDATE users SET
            username = COALESCE($1, username),
            full_name = COALESCE($2, full_name),
            bio = COALESCE($3, bio),
            country_of_origin = COALESCE($4, country_of_origin),
            current_location = COALESCE($5, current_location),
            avatar_url = COALESCE($6, avatar_url),
            location = COALESCE($7, location),
            website = COALESCE($8, website),
            banner_url = COALESCE($9, banner_url),
            twitter_handle = COALESCE($10, twitter_handle),
            linkedin_url = COALESCE($11, linkedin_url),
            visa_status = COALESCE($12, visa_status),
            city = COALESCE($13, city),
            country = COALESCE($14, country),
            country_code = COALESCE($15, country_code),
            latitude = COALESCE($16, latitude),
            longitude = COALESCE($17, longitude),
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $18
           RETURNING id, email, username, full_name, avatar_url, bio, country_of_origin, current_location,
                     location, website, banner_url, twitter_handle, linkedin_url, visa_status,
                     city, country, country_code, latitude, longitude`,
          [username, full_name, bio, country_of_origin, current_location, avatar_url,
           location, website, banner_url, twitter_handle, linkedin_url, visa_status,
           city, country, country_code, latitude, longitude,
           req.user!.id]
        );
      } else {
        // Fallback without username column
        result = await query(
          `UPDATE users SET
            full_name = COALESCE($1, full_name),
            bio = COALESCE($2, bio),
            country_of_origin = COALESCE($3, country_of_origin),
            current_location = COALESCE($4, current_location),
            avatar_url = COALESCE($5, avatar_url),
            location = COALESCE($6, location),
            website = COALESCE($7, website),
            banner_url = COALESCE($8, banner_url),
            twitter_handle = COALESCE($9, twitter_handle),
            linkedin_url = COALESCE($10, linkedin_url),
            visa_status = COALESCE($11, visa_status),
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $12
           RETURNING id, email, full_name, avatar_url, bio, country_of_origin, current_location,
                     location, website, banner_url, twitter_handle, linkedin_url, visa_status`,
          [full_name, bio, country_of_origin, current_location, avatar_url,
           location, website, banner_url, twitter_handle, linkedin_url, visa_status,
           req.user!.id]
        );
      }
    } catch (error: any) {
      // If we still get username column error, try without it
      if (error.message?.includes('column') && error.message?.includes('username')) {
        result = await query(
          `UPDATE users SET
            full_name = COALESCE($1, full_name),
            bio = COALESCE($2, bio),
            country_of_origin = COALESCE($3, country_of_origin),
            current_location = COALESCE($4, current_location),
            avatar_url = COALESCE($5, avatar_url),
            location = COALESCE($6, location),
            website = COALESCE($7, website),
            banner_url = COALESCE($8, banner_url),
            twitter_handle = COALESCE($9, twitter_handle),
            linkedin_url = COALESCE($10, linkedin_url),
            visa_status = COALESCE($11, visa_status),
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $12
           RETURNING id, email, full_name, avatar_url, bio, country_of_origin, current_location,
                     location, website, banner_url, twitter_handle, linkedin_url, visa_status`,
          [full_name, bio, country_of_origin, current_location, avatar_url,
           location, website, banner_url, twitter_handle, linkedin_url, visa_status,
           req.user!.id]
        );
      } else {
        throw error;
      }
    }

    console.log('Profile updated successfully for user:', req.user!.id);

    return res.json({ success: true, data: { user: result.rows[0] } });
  } catch (error) {
    console.error('Error updating profile:', error);
    return next(error);
  }
});

// Upload avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { mimetype, buffer } = req.file;

    // Update user's avatar in database
    const result = await query(
      `UPDATE users SET avatar_data = $1, avatar_mime_type = $2, avatar_url = $3
       WHERE id = $4 RETURNING id, email, full_name, bio, country_of_origin, current_location`,
      [buffer, mimetype, `/api/images/avatar/${req.user!.id}`, req.user!.id]
    );

    return res.json({
      success: true,
      data: {
        user: result.rows[0],
        avatarUrl: `/api/images/avatar/${req.user!.id}`
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Upload banner
router.post('/banner', authenticate, upload.single('banner'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { mimetype, buffer } = req.file;

    // Update user's banner in database
    const result = await query(
      `UPDATE users SET banner_data = $1, banner_mime_type = $2, banner_url = $3
       WHERE id = $4 RETURNING id, email, full_name, bio, country_of_origin, current_location`,
      [buffer, mimetype, `/api/images/banner/${req.user!.id}`, req.user!.id]
    );

    return res.json({
      success: true,
      data: {
        user: result.rows[0],
        bannerUrl: `/api/images/banner/${req.user!.id}`
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Get user's stories
router.get('/:id/stories', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar,
              (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as likes_count,
              (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comments_count,
              COALESCE((SELECT COUNT(*) FROM reposts WHERE story_id = s.id), 0) as reposts_count
       FROM stories s
       JOIN users u ON s.author_id = u.id
       WHERE s.author_id = $1 AND s.status = 'published'
       ORDER BY s.published_at DESC`,
      [id]
    );

    res.json({ success: true, data: { stories: result.rows } });
  } catch (error) {
    next(error);
  }
});

// Get user's liked stories
router.get('/me/likes', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      `SELECT s.*, u.full_name as author_name, u.avatar_url as author_avatar,
              (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as likes_count,
              (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comments_count,
              COALESCE((SELECT COUNT(*) FROM reposts WHERE story_id = s.id), 0) as reposts_count,
              l.created_at as liked_at
       FROM likes l
       JOIN stories s ON l.story_id = s.id
       JOIN users u ON s.author_id = u.id
       WHERE l.user_id = $1 AND s.status = 'published'
       ORDER BY l.created_at DESC`,
      [req.user!.id]
    );

    res.json({ success: true, data: { stories: result.rows } });
  } catch (error) {
    next(error);
  }
});

export default router;
