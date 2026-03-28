import express from 'express';
import { userController } from '../controllers/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  validateProfileUpdate,
  validateId
} from '../middleware/validation.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Protected routes
router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, validateProfileUpdate, userController.updateProfile);
router.post('/me/avatar', authenticate, upload.single('avatar'), handleUploadError, userController.uploadAvatar);
router.get('/online', authenticate, userController.getOnlineUsers);

// Admin routes
router.get('/', authenticate, requireAdmin, userController.getAllUsers);
router.get('/stats', authenticate, requireAdmin, userController.getStats);
router.get('/:id', authenticate, requireAdmin, validateId, userController.getUserById);
router.patch('/:id/role', authenticate, requireAdmin, validateId, userController.changeRole);
router.patch('/:id/ban', authenticate, requireAdmin, validateId, userController.toggleBan);

export default router;
