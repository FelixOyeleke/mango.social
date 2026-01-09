import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  getSavedJobs,
  saveJob,
  unsaveJob,
  checkJobSaved
} from '../controllers/savedJobsController.js';

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

router.get('/', getSavedJobs);
router.get('/check/:job_id', checkJobSaved);

router.post(
  '/',
  [
    body('job_id').isUUID().withMessage('Valid job ID is required'),
  ],
  validate,
  saveJob
);

router.delete('/:id', unsaveJob);

export default router;
