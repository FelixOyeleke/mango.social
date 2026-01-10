import { Request, Response } from 'express';
import { query } from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';

// Get user's saved jobs
export const getSavedJobs = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        sj.id as saved_id,
        sj.created_at as saved_at,
        j.*,
        u.full_name as employer_name
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN users u ON j.employer_id = u.id
      WHERE sj.user_id = $1
      ORDER BY sj.created_at DESC
    `, [req.user!.id]);

    res.json({
      success: true,
      data: { savedJobs: result.rows }
    });
  } catch (error) {
    throw error;
  }
};

// Save a job
export const saveJob = async (req: Request, res: Response) => {
  try {
    const { job_id } = req.body;

    // Check if job exists
    const jobResult = await query('SELECT id FROM jobs WHERE id = $1', [job_id]);
    if (jobResult.rows.length === 0) {
      throw createError('Job not found', 404);
    }

    // Check if already saved
    const existingSave = await query(
      'SELECT id FROM saved_jobs WHERE job_id = $1 AND user_id = $2',
      [job_id, req.user!.id]
    );
    if (existingSave.rows.length > 0) {
      throw createError('Job already saved', 400);
    }

    const result = await query(`
      INSERT INTO saved_jobs (job_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    `, [job_id, req.user!.id]);

    res.status(201).json({
      success: true,
      data: { savedJob: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Unsave a job
export const unsaveJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user owns this saved job
    const checkResult = await query('SELECT user_id FROM saved_jobs WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      throw createError('Saved job not found', 404);
    }
    if (checkResult.rows[0].user_id !== req.user!.id) {
      throw createError('Unauthorized', 403);
    }

    await query('DELETE FROM saved_jobs WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    throw error;
  }
};

// Check if job is saved
export const checkJobSaved = async (req: Request, res: Response) => {
  try {
    const { job_id } = req.params;

    const result = await query(
      'SELECT id FROM saved_jobs WHERE job_id = $1 AND user_id = $2',
      [job_id, req.user!.id]
    );

    res.json({
      success: true,
      data: { isSaved: result.rows.length > 0 }
    });
  } catch (error) {
    throw error;
  }
};

