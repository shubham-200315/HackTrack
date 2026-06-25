import { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Authentication actions
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;
