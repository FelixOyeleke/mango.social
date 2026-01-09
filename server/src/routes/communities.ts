import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  getCommunities,
  getCommunity,
  createCommunity,
  joinCommunity,
  leaveCommunity
} from '../controllers/communitiesController.js';

const router = express.Router();

const validate: express.RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return next();
};

// Get all communities (public route)
router.get('/', getCommunities);

// Get single community (public route)
router.get('/:slug', getCommunity);

// Create community (requires auth)
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Community name is required'),
    body('description').optional().trim(),
    body('is_private').optional().isBoolean(),
    body('rules').optional().trim(),
  ],
  validate,
  createCommunity
);

// Join community (requires auth)
router.post('/:id/join', authenticate, joinCommunity);

// Leave community (requires auth)
router.delete('/:id/leave', authenticate, leaveCommunity);

export default router;
