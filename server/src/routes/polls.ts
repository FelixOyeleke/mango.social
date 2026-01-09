import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { getPollByStoryId, votePoll } from '../controllers/pollsController.js';

const router = express.Router();

const validate: express.RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return next();
};

// Get poll by story ID (public, but shows user vote if authenticated)
router.get('/story/:storyId', optionalAuth, getPollByStoryId);

// Vote on a poll (requires authentication)
router.post(
  '/vote',
  authenticate,
  [
    body('poll_option_id').isUUID().withMessage('Valid poll option ID is required'),
  ],
  validate,
  votePoll
);

export default router;

