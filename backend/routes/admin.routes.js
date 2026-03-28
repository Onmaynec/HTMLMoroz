import express from 'express';
import { adminController } from '../controllers/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin access
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/system-status', adminController.getSystemStatus);

// Logs
router.get('/logs', adminController.getLogs);

// Announcements
router.post('/announcements', adminController.sendAnnouncement);

// Cleanup
router.post('/cleanup', adminController.cleanupOldData);

export default router;
