import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import profileRoutes from './routes/profile.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import studyPlanRoutes from './routes/studyPlan.routes.js';
import progressRoutes from './routes/progress.routes.js';

dotenv.config();

const app = express();

app.use(helmet());

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

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

app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/progress', progressRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err);
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
