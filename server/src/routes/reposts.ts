import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  repostStory,
  undoRepost,
  getReposters,
  checkRepost
} from '../controllers/repostsController.js';

const router = express.Router();

const validate: express.RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return next();
};

// All routes require authentication
router.use(authenticate);

// Repost a story
router.post(
  '/',
  [
    body('story_id').notEmpty().withMessage('Story identifier is required'),
    body('comment').optional().trim(),
  ],
  validate,
  repostStory
);

// Undo repost
router.delete('/:story_id', undoRepost);

// Get users who reposted a story
router.get('/:story_id/reposters', getReposters);

// Check if user has reposted a story
router.get('/:story_id/check', checkRepost);

export default router;
