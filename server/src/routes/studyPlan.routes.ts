import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createStudyPlan, getStudyPlans, getStudyPlanById } from '../controllers/studyPlan.controller';

const router = Router();

// Secure study plan endpoints
router.post('/', requireAuth as any, createStudyPlan as any);
router.get('/', requireAuth as any, getStudyPlans as any);
router.get('/:id', requireAuth as any, getStudyPlanById as any);

export default router;
