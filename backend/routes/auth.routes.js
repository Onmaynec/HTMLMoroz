import express from 'express';
import { authController } from '../controllers/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/check-application/:applicationId', authController.checkApplication);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
