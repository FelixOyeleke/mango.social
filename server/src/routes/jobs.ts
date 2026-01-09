import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobsController.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes (require authentication)
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('company_name').trim().notEmpty().withMessage('Company name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('job_type').isIn(['full-time', 'part-time', 'contract', 'internship']).withMessage('Invalid job type'),
  ],
  createJob
);

router.put('/:id', authenticate, updateJob);
router.delete('/:id', authenticate, deleteJob);

export default router;

