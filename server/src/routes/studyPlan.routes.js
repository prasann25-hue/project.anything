import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createStudyPlan, getStudyPlans, getStudyPlanById } from '../controllers/studyPlan.controller.js';

const router = Router();

router.post('/', requireAuth, createStudyPlan);
router.get('/', requireAuth, getStudyPlans);
router.get('/:id', requireAuth, getStudyPlanById);

export default router;
