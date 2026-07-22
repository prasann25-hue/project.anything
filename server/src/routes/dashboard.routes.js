import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', requireAuth, getDashboardStats);

export default router;
