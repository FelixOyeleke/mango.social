import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  followUser,
  unfollowUser,
  checkFollowing,
  checkMutualFollow,
  getFollowers,
  getFollowing
} from '../controllers/followsController.js';

const router = express.Router();

// Follow a user
router.post('/:userId/follow', authenticate, followUser);

// Unfollow a user
router.delete('/:userId/follow', authenticate, unfollowUser);

// Check if following a user
router.get('/:userId/check', authenticate, checkFollowing);

// Check mutual follow status
router.get('/:userId/mutual', authenticate, checkMutualFollow);

// Get user's followers (public)
router.get('/:userId/followers', getFollowers);

// Get users that a user is following (public)
router.get('/:userId/following', getFollowing);

export default router;
