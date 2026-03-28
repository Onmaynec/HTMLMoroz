import express from 'express';
import { logController } from '../controllers/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin access
router.use(authenticate, requireAdmin);

// Get logs
router.get('/', logController.getAllLogs);
router.get('/stats', logController.getLogStats);
router.get('/recent', logController.getRecentActivity);

export default router;
