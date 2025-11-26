import express from 'express';
import { googleLogin, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/google', googleLogin);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;
