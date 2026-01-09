import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  getUserApplications,
  applyToJob,
  getApplication,
  updateApplicationStatus,
  withdrawApplication
} from '../controllers/applicationsController.js';

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

router.get('/', getUserApplications);
router.get('/:id', getApplication);

router.post(
  '/',
  [
    body('job_id').isUUID().withMessage('Valid job ID is required'),
    body('cover_letter').optional().trim(),
    body('resume_url').optional().isURL().withMessage('Valid resume URL required'),
  ],
  validate,
  applyToJob
);

router.put(
  '/:id/status',
  [
    body('status').isIn(['pending', 'reviewing', 'interview', 'rejected', 'accepted']).withMessage('Invalid status'),
  ],
  validate,
  updateApplicationStatus
);

router.delete('/:id', withdrawApplication);

export default router;
