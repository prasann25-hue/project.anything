import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getDashboardStats } from '../controllers/dashboard.controller';

const router = Router();

// Secure dashboard stats
router.get('/', requireAuth as any, getDashboardStats as any);

export default router;
