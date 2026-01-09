import { Response } from 'express';
import { query } from '../db/connection.js';
import { AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

// Get user's applications
export const getUserApplications = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        ja.*,
        j.title as job_title,
        j.company_name,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.status as job_status
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = $1
      ORDER BY ja.applied_at DESC
    `, [req.user!.id]);

    res.json({
      success: true,
      data: { applications: result.rows }
    });
  } catch (error) {
    throw error;
  }
};

// Apply to a job
export const applyToJob = async (req: AuthRequest, res: Response) => {
  try {
    const { job_id, cover_letter, resume_url } = req.body;

    // Check if job exists and is active
    const jobResult = await query('SELECT id, status FROM jobs WHERE id = $1', [job_id]);
    if (jobResult.rows.length === 0) {
      throw createError('Job not found', 404);
    }
    if (jobResult.rows[0].status !== 'active') {
      throw createError('This job is no longer accepting applications', 400);
    }

    // Check if already applied
    const existingApplication = await query(
      'SELECT id FROM job_applications WHERE job_id = $1 AND user_id = $2',
      [job_id, req.user!.id]
    );
    if (existingApplication.rows.length > 0) {
      throw createError('You have already applied to this job', 400);
    }

    // Create application
    const result = await query(`
      INSERT INTO job_applications (job_id, user_id, cover_letter, resume_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [job_id, req.user!.id, cover_letter, resume_url]);

    // Increment applications count
    await query('UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1', [job_id]);

    res.status(201).json({
      success: true,
      data: { application: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Get single application
export const getApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        ja.*,
        j.title as job_title,
        j.company_name,
        j.description as job_description,
        j.location,
        j.employer_id,
        u.full_name as applicant_name,
        u.email as applicant_email,
        u.avatar_url as applicant_avatar
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN users u ON ja.user_id = u.id
      WHERE ja.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw createError('Application not found', 404);
    }

    const application = result.rows[0];

    // Check if user is the applicant or the employer
    if (application.user_id !== req.user!.id && application.employer_id !== req.user!.id) {
      throw createError('Unauthorized', 403);
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    throw error;
  }
};

// Update application status (employer only)
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if application exists and user is the employer
    const checkResult = await query(`
      SELECT ja.id, j.employer_id
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.id = $1
    `, [id]);

    if (checkResult.rows.length === 0) {
      throw createError('Application not found', 404);
    }
    if (checkResult.rows[0].employer_id !== req.user!.id) {
      throw createError('Unauthorized', 403);
    }

    const result = await query(`
      UPDATE job_applications
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    res.json({
      success: true,
      data: { application: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Withdraw application
export const withdrawApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user owns this application
    const checkResult = await query('SELECT user_id, job_id FROM job_applications WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      throw createError('Application not found', 404);
    }
    if (checkResult.rows[0].user_id !== req.user!.id) {
      throw createError('Unauthorized', 403);
    }

    await query('DELETE FROM job_applications WHERE id = $1', [id]);

    // Decrement applications count
    await query('UPDATE jobs SET applications_count = applications_count - 1 WHERE id = $1', [checkResult.rows[0].job_id]);

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    throw error;
  }
};

