import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount
} from '../controllers/messagesController.js';

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

// Get user's conversations
router.get('/conversations', getConversations);

// Get or create conversation with a user
router.post(
  '/conversations',
  [
    body('user_id').isUUID().withMessage('Valid user ID is required'),
  ],
  validate,
  getOrCreateConversation
);

// Get messages in a conversation
router.get('/conversations/:conversation_id/messages', getMessages);

// Send a message
router.post(
  '/messages',
  [
    body('conversation_id').isUUID().withMessage('Valid conversation ID is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
    body('message_type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type'),
  ],
  validate,
  sendMessage
);

// Mark conversation as read
router.put('/conversations/:conversation_id/read', markAsRead);

// Delete a message
router.delete('/messages/:id', deleteMessage);

// Get unread count
router.get('/unread-count', getUnreadCount);

export default router;
