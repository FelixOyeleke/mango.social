import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  joinWaitlist,
  getWaitlistEntries,
  getWaitlistStats,
  updateWaitlistEntry
} from '../controllers/waitlistController.js';

const router = express.Router();

// Public route - Join waitlist
router.post(
  '/',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('reason').optional().trim(),
    body('interest_area').optional().trim(),
    body('referral_source').optional().trim(),
  ],
  validate,
  joinWaitlist
);

// Admin routes - require authentication and admin role
router.get(
  '/',
  authenticate,
  authorize('admin'),
  getWaitlistEntries
);

router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  getWaitlistStats
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [
    body('status').optional().isIn(['pending', 'approved', 'invited', 'rejected']),
    body('notes').optional().trim(),
  ],
  validate,
  updateWaitlistEntry
);

export default router;

