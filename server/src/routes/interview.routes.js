import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  startInterview,
  getInterviews,
  getInterviewById,
  generateNextQuestion,
  submitAnswer,
  completeInterview
} from '../controllers/interview.controller.js';

const router = Router();

router.post('/start', requireAuth, startInterview);
router.get('/', requireAuth, getInterviews);
router.get('/:id', requireAuth, getInterviewById);
router.post('/:id/question', requireAuth, generateNextQuestion);
router.post('/:id/answer', requireAuth, submitAnswer);
router.post('/:id/complete', requireAuth, completeInterview);

export default router;
