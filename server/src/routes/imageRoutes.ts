import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
  uploadImage,
  getImage,
  getUserAvatar,
  getUserBanner,
  getStoryImage,
  deleteImage
} from '../controllers/imageController.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Upload image (requires authentication)
router.post('/upload', authenticate, upload.single('image'), uploadImage);

// Get image by ID (public)
router.get('/:id', getImage);

// Get user avatar (public)
router.get('/avatar/:userId', getUserAvatar);

// Get user banner (public)
router.get('/banner/:userId', getUserBanner);

// Get story featured image (public)
router.get('/story/:storyId', getStoryImage);

// Delete image (requires authentication)
router.delete('/:id', authenticate, deleteImage);

export default router;

