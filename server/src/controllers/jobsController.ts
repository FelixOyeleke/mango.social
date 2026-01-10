import { Request, Response } from 'express';
import { query } from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';

// Get all jobs with filters
export const getJobs = async (req: Request, res: Response) => {
  try {
    const {
      search,
      location,
      remote_type,
      job_type,
      experience_level,
      visa_sponsorship,
      visa_types,
      salary_min,
      salary_max,
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    let queryText = `
      SELECT 
        j.*,
        u.full_name as employer_name,
        u.email as employer_email,
        COUNT(*) OVER() as total_count
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      WHERE j.status = 'active'
    `;

    const queryParams: any[] = [];
    let paramCount = 0;

    // Search filter
    if (search) {
      paramCount++;
      queryText += ` AND (j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount} OR j.company_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Location filter
    if (location) {
      paramCount++;
      queryText += ` AND j.location ILIKE $${paramCount}`;
      queryParams.push(`%${location}%`);
    }

    // Remote type filter
    if (remote_type) {
      paramCount++;
      queryText += ` AND j.remote_type = $${paramCount}`;
      queryParams.push(remote_type);
    }

    // Job type filter
    if (job_type) {
      paramCount++;
      queryText += ` AND j.job_type = $${paramCount}`;
      queryParams.push(job_type);
    }

    // Experience level filter
    if (experience_level) {
      paramCount++;
      queryText += ` AND j.experience_level = $${paramCount}`;
      queryParams.push(experience_level);
    }

    // Visa sponsorship filter
    if (visa_sponsorship === 'true') {
      queryText += ` AND j.visa_sponsorship = true`;
    }

    // Visa types filter
    if (visa_types) {
      paramCount++;
      queryText += ` AND j.visa_types && $${paramCount}`;
      queryParams.push(Array.isArray(visa_types) ? visa_types : [visa_types]);
    }

    // Salary filter
    if (salary_min) {
      paramCount++;
      queryText += ` AND j.salary_max >= $${paramCount}`;
      queryParams.push(salary_min);
    }

    if (salary_max) {
      paramCount++;
      queryText += ` AND j.salary_min <= $${paramCount}`;
      queryParams.push(salary_max);
    }

    // Sorting
    const allowedSortFields = ['created_at', 'title', 'salary_min', 'applications_count', 'views_count'];
    const sortField = allowedSortFields.includes(sort as string) ? sort : 'created_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    queryText += ` ORDER BY j.${sortField} ${sortOrder}`;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await query(queryText, queryParams);

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / Number(limit));

    res.json({
      success: true,
      data: {
        jobs: result.rows.map(row => {
          const { total_count, ...job } = row;
          return job;
        }),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalCount,
          totalPages
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

// Get single job
export const getJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Increment view count
    await query('UPDATE jobs SET views_count = views_count + 1 WHERE id = $1', [id]);

    const result = await query(`
      SELECT 
        j.*,
        u.full_name as employer_name,
        u.email as employer_email,
        u.avatar_url as employer_avatar
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      WHERE j.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw createError('Job not found', 404);
    }

    res.json({
      success: true,
      data: { job: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Create job (employer only)
export const createJob = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      company_name,
      company_logo,
      location,
      remote_type,
      job_type,
      experience_level,
      salary_min,
      salary_max,
      salary_currency,
      visa_sponsorship,
      visa_types,
      relocation_assistance,
      skills,
      requirements,
      benefits,
      application_url,
      application_email,
      application_deadline,
      expires_at
    } = req.body;

    const result = await query(`
      INSERT INTO jobs (
        employer_id, title, description, company_name, company_logo,
        location, remote_type, job_type, experience_level,
        salary_min, salary_max, salary_currency,
        visa_sponsorship, visa_types, relocation_assistance,
        skills, requirements, benefits,
        application_url, application_email, application_deadline, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `, [
      req.user!.id, title, description, company_name, company_logo,
      location, remote_type, job_type, experience_level,
      salary_min, salary_max, salary_currency || 'USD',
      visa_sponsorship || false, visa_types || [], relocation_assistance || false,
      skills || [], requirements, benefits,
      application_url, application_email, application_deadline, expires_at
    ]);

    res.status(201).json({
      success: true,
      data: { job: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Update job (employer only)
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user owns this job
    const checkResult = await query('SELECT employer_id FROM jobs WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      throw createError('Job not found', 404);
    }
    if (checkResult.rows[0].employer_id !== req.user!.id) {
      throw createError('Unauthorized', 403);
    }

    const {
      title, description, company_name, company_logo, location, remote_type,
      job_type, experience_level, salary_min, salary_max, salary_currency,
      visa_sponsorship, visa_types, relocation_assistance, skills,
      requirements, benefits, application_url, application_email,
      application_deadline, status, expires_at
    } = req.body;

    const result = await query(`
      UPDATE jobs SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        company_name = COALESCE($3, company_name),
        company_logo = COALESCE($4, company_logo),
        location = COALESCE($5, location),
        remote_type = COALESCE($6, remote_type),
        job_type = COALESCE($7, job_type),
        experience_level = COALESCE($8, experience_level),
        salary_min = COALESCE($9, salary_min),
        salary_max = COALESCE($10, salary_max),
        salary_currency = COALESCE($11, salary_currency),
        visa_sponsorship = COALESCE($12, visa_sponsorship),
        visa_types = COALESCE($13, visa_types),
        relocation_assistance = COALESCE($14, relocation_assistance),
        skills = COALESCE($15, skills),
        requirements = COALESCE($16, requirements),
        benefits = COALESCE($17, benefits),
        application_url = COALESCE($18, application_url),
        application_email = COALESCE($19, application_email),
        application_deadline = COALESCE($20, application_deadline),
        status = COALESCE($21, status),
        expires_at = COALESCE($22, expires_at),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $23
      RETURNING *
    `, [
      title, description, company_name, company_logo, location, remote_type,
      job_type, experience_level, salary_min, salary_max, salary_currency,
      visa_sponsorship, visa_types, relocation_assistance, skills,
      requirements, benefits, application_url, application_email,
      application_deadline, status, expires_at, id
    ]);

    res.json({
      success: true,
      data: { job: result.rows[0] }
    });
  } catch (error) {
    throw error;
  }
};

// Delete job (employer only)
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user owns this job
    const checkResult = await query('SELECT employer_id FROM jobs WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      throw createError('Job not found', 404);
    }
    if (checkResult.rows[0].employer_id !== req.user!.id) {
      throw createError('Unauthorized', 403);
    }

    await query('DELETE FROM jobs WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    throw error;
  }
};

