import express from 'express';
import { chatController } from '../controllers/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateMessage } from '../middleware/validation.js';

const router = express.Router();

// Protected routes
router.get('/:applicationId/messages', authenticate, chatController.getChatHistory);
router.post('/:applicationId/messages', authenticate, validateMessage, chatController.sendMessage);
router.get('/:applicationId/unread', authenticate, chatController.getUnreadCount);
router.post('/:applicationId/read', authenticate, chatController.markAsRead);

// Admin routes
router.get('/admin/unread-chats', authenticate, requireAdmin, chatController.getChatsWithUnread);

export default router;
