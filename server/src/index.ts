import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import storyRoutes from './routes/stories.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import bookmarkRoutes from './routes/bookmarks.js';
import newsletterRoutes from './routes/newsletter.js';
import statsRoutes from './routes/stats.js';
import imageRoutes from './routes/imageRoutes.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import savedJobsRoutes from './routes/savedJobs.js';
import messageRoutes from './routes/messages.js';
import repostRoutes from './routes/reposts.js';
import communityRoutes from './routes/communities.js';
import adminRoutes from './routes/admin.js';
import followRoutes from './routes/follows.js';
import notificationRoutes from './routes/notifications.js';
import hashtagRoutes from './routes/hashtags.js';
import pollRoutes from './routes/polls.js';
import appRoutes from './routes/apps.js';
import waitlistRoutes from './routes/waitlist.js';
import { errorHandler } from './middleware/errorHandler.js';
import { pool } from './db/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/saved-jobs', savedJobsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reposts', repostRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hashtags', hashtagRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/waitlist', waitlistRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  
  // Test database connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Database connection failed:', err);
    } else {
      console.log('✅ Database connected successfully');
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

