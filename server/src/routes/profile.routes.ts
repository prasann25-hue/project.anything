import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();

// Secure profile routes
router.get('/', requireAuth as any, getProfile as any);
router.put('/', requireAuth as any, updateProfile as any);

export default router;
