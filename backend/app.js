import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import chatRoutes from './routes/chats.routes.js';
import messageRoutes from './routes/messages.routes.js';
import feelingRoutes from './routes/feelings.routes.js';
import userRoutes from './routes/users.routes.js';
import authRoutes from './routes/auth.routes.js';
import penaltyRoutes from './routes/penalties.routes.js';
import noteRoutes from './routes/notes.routes.js';
import replyRoutes from './routes/replies.routes.js';
import digestRoutes from './routes/digests.routes.js';
import quizRoutes from './routes/quiz.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Echo Tree API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feelings', feelingRoutes);
app.use('/api/penalties', penaltyRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/digests', digestRoutes);
app.use('/api/quiz', quizRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;

