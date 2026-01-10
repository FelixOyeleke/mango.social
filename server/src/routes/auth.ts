import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError('JWT secret is not configured', 500);
  }
  return secret;
}

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('full_name').trim().notEmpty(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, full_name } = req.body;

      // Check if user exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        throw createError('Email already registered', 400);
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 12);

      // Generate username from email (before @)
      let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      let username = baseUsername;
      let counter = 1;

      // Check if username exists and make it unique
      let usernameExists = true;
      while (usernameExists) {
        try {
          const checkUsername = await query('SELECT id FROM users WHERE username = $1', [username]);
          if (checkUsername.rows.length === 0) {
            usernameExists = false;
          } else {
            username = `${baseUsername}${counter}`;
            counter++;
          }
        } catch (error: any) {
          // If username column doesn't exist, skip username generation
          if (error.message?.includes('column') && error.message?.includes('username')) {
            username = null;
            usernameExists = false;
          } else {
            throw error;
          }
        }
      }

      // Create user with auto-generated username
      let result;
      try {
        result = await query(
          'INSERT INTO users (email, password_hash, full_name, username) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, username, created_at',
          [email, password_hash, full_name, username]
        );
      } catch (error: any) {
        // If username column doesn't exist, create without it
        if (error.message?.includes('column') && error.message?.includes('username')) {
          result = await query(
            'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at',
            [email, password_hash, full_name]
          );
        } else {
          throw error;
        }
      }

      const user = result.rows[0];

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: 'user' },
        getJwtSecret(),
        { expiresIn: jwtExpiresIn }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            username: user.username,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ success: false, error: 'Invalid input', errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log('Login attempt for:', email);

      // Find user by email or username (case-insensitive)
      // Try with username column first, fallback to email only if column doesn't exist
      let result;
      try {
        result = await query(
          'SELECT id, email, username, password_hash, full_name, role, avatar_url, followers_count, following_count FROM users WHERE (LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)) AND is_active = true',
          [email]
        );
      } catch (error: any) {
        // If username column doesn't exist yet, try without it
        if (error.message?.includes('column') && error.message?.includes('username')) {
          console.log('Username column not found, using email only');
          result = await query(
            'SELECT id, email, password_hash, full_name, role, avatar_url, followers_count, following_count FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true',
            [email]
          );
        } else {
          throw error;
        }
      }

      if (result.rows.length === 0) {
        console.log('User not found:', email);
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      console.log('User found:', user.email);

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        console.log('Invalid password for:', email);
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      console.log('Password verified, generating token...');

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        getJwtSecret(),
        { expiresIn: jwtExpiresIn }
      );

      console.log('Token generated successfully');

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            username: user.username,
            avatar_url: user.avatar_url,
            role: user.role,
            followers_count: user.followers_count || 0,
            following_count: user.following_count || 0,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred during login. Please try again.'
      });
    }
  }
);

// Get current user
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw createError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    // Try with username column first, fallback if it doesn't exist
    let result;
    try {
      result = await query(
        `SELECT id, email, username, full_name, avatar_url, bio, country_of_origin, current_location, role,
                location, website, banner_url, twitter_handle, linkedin_url, visa_status, created_at,
                followers_count, following_count
         FROM users WHERE id = $1`,
        [decoded.id]
      );
    } catch (error: any) {
      // If username column doesn't exist yet, try without it
      if (error.message?.includes('column') && error.message?.includes('username')) {
        result = await query(
          `SELECT id, email, full_name, avatar_url, bio, country_of_origin, current_location, role,
                  location, website, banner_url, twitter_handle, linkedin_url, visa_status, created_at,
                  followers_count, following_count
           FROM users WHERE id = $1`,
          [decoded.id]
        );
      } else {
        throw error;
      }
    }

    if (result.rows.length === 0) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
