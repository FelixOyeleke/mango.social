import { Request, Response } from 'express';
import { query } from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';

// Create a poll (called when creating a story with poll)
export const createPoll = async (
  storyId: string,
  question: string,
  options: string[],
  expiresAt?: string
) => {
  try {
    // Create poll
    const pollResult = await query(
      `INSERT INTO polls (story_id, question, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [storyId, question, expiresAt || null]
    );

    const poll = pollResult.rows[0];

    // Create poll options
    for (let i = 0; i < options.length; i++) {
      await query(
        `INSERT INTO poll_options (poll_id, option_text, option_order)
         VALUES ($1, $2, $3)`,
        [poll.id, options[i], i]
      );
    }

    return poll;
  } catch (error) {
    throw error;
  }
};

// Get poll by story ID
export const getPollByStoryId = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;
    const userId = req.user?.id;

    // Get poll
    const pollResult = await query(
      `SELECT * FROM polls WHERE story_id = $1`,
      [storyId]
    );

    if (pollResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }

    const poll = pollResult.rows[0];

    // Get poll options with vote counts
    const optionsResult = await query(
      `SELECT 
        po.*,
        COUNT(pv.id) as votes_count,
        ${userId ? `EXISTS(SELECT 1 FROM poll_votes WHERE poll_option_id = po.id AND user_id = $2) as has_voted` : 'false as has_voted'}
       FROM poll_options po
       LEFT JOIN poll_votes pv ON po.id = pv.poll_option_id
       WHERE po.poll_id = $1
       GROUP BY po.id
       ORDER BY po.option_order`,
      userId ? [poll.id, userId] : [poll.id]
    );

    // Get user's voted option if authenticated
    let userVotedOptionId = null;
    if (userId) {
      const voteResult = await query(
        `SELECT pv.poll_option_id
         FROM poll_votes pv
         JOIN poll_options po ON pv.poll_option_id = po.id
         WHERE po.poll_id = $1 AND pv.user_id = $2
         LIMIT 1`,
        [poll.id, userId]
      );
      if (voteResult.rows.length > 0) {
        userVotedOptionId = voteResult.rows[0].poll_option_id;
      }
    }

    const totalVotes = optionsResult.rows.reduce((sum, opt) => sum + parseInt(opt.votes_count), 0);

    res.json({
      success: true,
      data: {
        poll: {
          ...poll,
          options: optionsResult.rows,
          total_votes: totalVotes,
          user_voted_option_id: userVotedOptionId
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

// Vote on a poll
export const votePoll = async (req: Request, res: Response) => {
  try {
    const { poll_option_id } = req.body;
    const userId = req.user!.id;

    // Check if option exists and get poll_id
    const optionResult = await query(
      `SELECT po.*, p.expires_at
       FROM poll_options po
       JOIN polls p ON po.poll_id = p.id
       WHERE po.id = $1`,
      [poll_option_id]
    );

    if (optionResult.rows.length === 0) {
      throw createError('Poll option not found', 404);
    }

    const option = optionResult.rows[0];

    // Check if poll has expired
    if (option.expires_at && new Date(option.expires_at) < new Date()) {
      throw createError('This poll has expired', 400);
    }

    // Check if user has already voted on this poll
    const existingVote = await query(
      `SELECT pv.id
       FROM poll_votes pv
       JOIN poll_options po ON pv.poll_option_id = po.id
       WHERE po.poll_id = $1 AND pv.user_id = $2`,
      [option.poll_id, userId]
    );

    if (existingVote.rows.length > 0) {
      throw createError('You have already voted on this poll', 400);
    }

    // Create vote
    await query(
      `INSERT INTO poll_votes (user_id, poll_option_id)
       VALUES ($1, $2)`,
      [userId, poll_option_id]
    );

    // Update votes count
    await query(
      `UPDATE poll_options
       SET votes_count = votes_count + 1
       WHERE id = $1`,
      [poll_option_id]
    );

    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    throw error;
  }
};

