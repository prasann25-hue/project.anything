import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  startInterview,
  getInterviews,
  getInterviewById,
  generateNextQuestion,
  submitAnswer,
  completeInterview
} from '../controllers/interview.controller';

const router = Router();

// Secure interview operations
router.post('/start', requireAuth as any, startInterview as any);
router.get('/', requireAuth as any, getInterviews as any);
router.get('/:id', requireAuth as any, getInterviewById as any);
router.post('/:id/question', requireAuth as any, generateNextQuestion as any);
router.post('/:id/answer', requireAuth as any, submitAnswer as any);
router.post('/:id/complete', requireAuth as any, completeInterview as any);

export default router;
