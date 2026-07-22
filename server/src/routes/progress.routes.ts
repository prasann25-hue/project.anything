import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getProgress } from '../controllers/progress.controller';

const router = Router();

// Secure progress tracking
router.get('/', requireAuth as any, getProgress as any);

export default router;
