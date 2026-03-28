import express from 'express';
import { applicationController } from '../controllers/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  validateApplication,
  validateStatusUpdate,
  validateId
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/', validateApplication, applicationController.createApplication);
router.get('/check/:discordUsername', applicationController.getMyApplication);

// Protected routes (admin only)
router.get('/', authenticate, requireAdmin, applicationController.getAllApplications);
router.get('/stats', authenticate, requireAdmin, applicationController.getStats);
router.get('/:id', authenticate, requireAdmin, validateId, applicationController.getApplicationById);
router.patch('/:id/status', authenticate, requireAdmin, validateId, validateStatusUpdate, applicationController.updateStatus);

export default router;
