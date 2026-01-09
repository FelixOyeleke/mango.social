import { Request, Response } from 'express';
import { pool } from '../db/connection.js';
import crypto from 'crypto';

// Upload image to database
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const filename = `${crypto.randomUUID()}-${originalname}`;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (size > maxSize) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }

    // Store image in database
    const result = await pool.query(
      `INSERT INTO images (user_id, filename, original_filename, mime_type, size, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, filename, original_filename, mime_type, size, created_at`,
      [userId, filename, originalname, mimetype, size, buffer]
    );

    const image = result.rows[0];

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        id: image.id,
        filename: image.filename,
        originalFilename: image.original_filename,
        mimeType: image.mime_type,
        size: image.size,
        url: `/api/images/${image.id}`,
        createdAt: image.created_at
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// Get image by ID
export const getImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT data, mime_type, filename FROM images WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = result.rows[0];

    // Set appropriate headers
    res.setHeader('Content-Type', image.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${image.filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Send image data
    res.send(image.data);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
};

// Get user's avatar
export const getUserAvatar = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT avatar_data, avatar_mime_type FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].avatar_data) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    const user = result.rows[0];

    res.setHeader('Content-Type', user.avatar_mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(user.avatar_data);
  } catch (error) {
    console.error('Error retrieving avatar:', error);
    res.status(500).json({ error: 'Failed to retrieve avatar' });
  }
};

// Get user's banner
export const getUserBanner = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT banner_data, banner_mime_type FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].banner_data) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    const user = result.rows[0];

    res.setHeader('Content-Type', user.banner_mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(user.banner_data);
  } catch (error) {
    console.error('Error retrieving banner:', error);
    res.status(500).json({ error: 'Failed to retrieve banner' });
  }
};

// Get story featured image
export const getStoryImage = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;

    const result = await pool.query(
      'SELECT featured_image_data, featured_image_mime_type FROM stories WHERE id = $1',
      [storyId]
    );

    if (result.rows.length === 0 || !result.rows[0].featured_image_data) {
      return res.status(404).json({ error: 'Story image not found' });
    }

    const story = result.rows[0];

    res.setHeader('Content-Type', story.featured_image_mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(story.featured_image_data);
  } catch (error) {
    console.error('Error retrieving story image:', error);
    res.status(500).json({ error: 'Failed to retrieve story image' });
  }
};

// Delete image
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if image belongs to user
    const result = await pool.query(
      'DELETE FROM images WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found or unauthorized' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};

