import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db/connection.js';

const router = express.Router();

// Subscribe to newsletter
router.post(
  '/subscribe',
  [body('email').isEmail().normalizeEmail()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      await query(
        'INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO UPDATE SET is_active = true',
        [email]
      );

      res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

