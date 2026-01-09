import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getTrending,
  search,
  getStoriesByHashtag,
  getHashtagDetails
} from '../controllers/hashtagsController.js';

const router = express.Router();

// Public routes
router.get('/trending', getTrending);
router.get('/search', search);
router.get('/:name', getHashtagDetails);
router.get('/:name/stories', getStoriesByHashtag);

export default router;

