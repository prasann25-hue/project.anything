import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import profileRoutes from './routes/profile.routes';
import dashboardRoutes from './routes/dashboard.routes';
import interviewRoutes from './routes/interview.routes';
import studyPlanRoutes from './routes/studyPlan.routes';
import progressRoutes from './routes/progress.routes';

dotenv.config();

const app = express();

// Secure headers
app.use(helmet());

// CORS settings
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser
app.use(express.json());

// Global Rate limiting (100 requests per 15 minutes per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Specific rate limit for AI operations (15 requests per 5 minutes to prevent prompt injection spam)
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: { error: 'AI request limit reached. Please wait a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/interviews/:id/question', aiLimiter);
app.use('/api/interviews/:id/answer', aiLimiter);
app.use('/api/study-plans', aiLimiter);

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/progress', progressRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err.stack || err);
  
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  
  res.status(status).json({
    error: message,
    // Avoid leaking stack trace in production environments
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
