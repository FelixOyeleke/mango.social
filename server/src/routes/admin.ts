import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  blockUser,
  suspendUser,
  sendMessageToUser,
  getStories,
  deleteStory,
  getRecentActivity
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/activity', getRecentActivity);

// User Management
router.get('/users', getUsers);
router.get('/users/:userId', getUserDetails);
router.put(
  '/users/:userId',
  [
    body('role').optional().isIn(['user', 'admin', 'moderator']),
    body('is_active').optional().isBoolean(),
    body('email_verified').optional().isBoolean(),
  ],
  updateUser
);
router.post(
  '/users/:userId/block',
  [
    body('is_blocked').isBoolean(),
    body('block_reason').optional().isString(),
  ],
  blockUser
);
router.post(
  '/users/:userId/suspend',
  [
    body('suspend_until').optional().isISO8601(),
    body('reason').optional().isString(),
  ],
  suspendUser
);
router.post(
  '/users/:userId/message',
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('subject').optional().isString(),
  ],
  sendMessageToUser
);
router.delete('/users/:userId', deleteUser);

// Story Management
router.get('/stories', getStories);
router.delete('/stories/:storyId', deleteStory);

export default router;

