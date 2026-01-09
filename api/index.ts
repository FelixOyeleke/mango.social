import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from '../server/src/routes/auth.js';
import storyRoutes from '../server/src/routes/stories.js';
import userRoutes from '../server/src/routes/users.js';
import commentRoutes from '../server/src/routes/comments.js';
import bookmarkRoutes from '../server/src/routes/bookmarks.js';
import newsletterRoutes from '../server/src/routes/newsletter.js';
import statsRoutes from '../server/src/routes/stats.js';
import imageRoutes from '../server/src/routes/imageRoutes.js';
import jobRoutes from '../server/src/routes/jobs.js';
import applicationRoutes from '../server/src/routes/applications.js';
import savedJobsRoutes from '../server/src/routes/savedJobs.js';
import messageRoutes from '../server/src/routes/messages.js';
import repostRoutes from '../server/src/routes/reposts.js';
import communityRoutes from '../server/src/routes/communities.js';
import adminRoutes from '../server/src/routes/admin.js';
import followRoutes from '../server/src/routes/follows.js';
import notificationRoutes from '../server/src/routes/notifications.js';
import hashtagRoutes from '../server/src/routes/hashtags.js';
import pollRoutes from '../server/src/routes/polls.js';
import appRoutes from '../server/src/routes/apps.js';
import { errorHandler } from '../server/src/middleware/errorHandler.js';

dotenv.config();

const app = express();

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
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

// Error handling
app.use(errorHandler);

// Export for Vercel serverless
export default app;

