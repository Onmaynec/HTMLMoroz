import { Message, Application, User, Notification } from '../models/index.js';
import { logger } from '../utils/logger.js';

// Get chat history for application
export const getChatHistory = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isApplicant = application.userId && 
      application.userId.toString() === req.userId.toString();

    if (!isAdmin && !isApplicant) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ applicationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'username avatar')
      .lean();

    const total = await Message.countDocuments({ applicationId });

    // Mark messages as read
    await Message.updateMany(
      {
        applicationId,
        senderId: { $ne: req.userId },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date(),
        readBy: req.userId
      }
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('GetChatHistory error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении истории чата'
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { content } = req.body;

    // Check if application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isApplicant = application.userId && 
      application.userId.toString() === req.userId.toString();

    if (!isAdmin && !isApplicant) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав'
      });
    }

    // Create message
    const message = new Message({
      applicationId,
      senderId: req.userId,
      senderRole: req.user.role,
      senderName: req.user.username,
      content: content.trim(),
      type: 'text'
    });

    await message.save();

    // Update application last message time
    application.lastMessageAt = new Date();
    await application.save();

    // Populate sender info
    await message.populate('senderId', 'username avatar');

    // Send real-time message via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`application_${applicationId}`).emit('new_message', {
        message: {
          id: message._id,
          content: message.content,
          sender: message.senderId,
          senderRole: message.senderRole,
          createdAt: message.createdAt
        }
      });

      // Notify the other party
      const notifyUserId = isAdmin ? application.userId : null;
      if (notifyUserId) {
        // Create notification
        const notification = new Notification({
          userId: notifyUserId,
          title: 'Новое сообщение',
          message: `Новое сообщение в чате по заявке`,
          type: 'new_message',
          relatedId: application._id,
          relatedType: 'Application',
          actionLink: `/applications/${applicationId}`,
          actionText: 'Открыть чат'
        });
        await notification.save();

        io.to(`user_${notifyUserId}`).emit('notification', { notification });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Сообщение отправлено',
      data: { message }
    });
  } catch (error) {
    logger.error('SendMessage error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отправке сообщения'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const count = await Message.getUnreadCount(applicationId, req.userId);

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    logger.error('GetUnreadCount error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении количества непрочитанных'
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { applicationId } = req.params;

    await Message.updateMany(
      {
        applicationId,
        senderId: { $ne: req.userId },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date(),
        readBy: req.userId
      }
    );

    res.json({
      success: true,
      message: 'Сообщения отмечены как прочитанные'
    });
  } catch (error) {
    logger.error('MarkAsRead error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отметке сообщений'
    });
  }
};

// Get applications with unread messages (for admin)
export const getChatsWithUnread = async (req, res) => {
  try {
    // Get all applications with messages
    const applications = await Application.find({
      lastMessageAt: { $ne: null }
    })
    .sort({ lastMessageAt: -1 })
    .select('gameNickname discordUsername status lastMessageAt')
    .lean();

    // Get unread counts for each
    const appsWithUnread = await Promise.all(
      applications.map(async (app) => {
        const unreadCount = await Message.countDocuments({
          applicationId: app._id,
          senderRole: { $ne: 'admin' },
          isRead: false
        });

        return {
          ...app,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: { applications: appsWithUnread }
    });
  } catch (error) {
    logger.error('GetChatsWithUnread error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении чатов'
    });
  }
};

export default {
  getChatHistory,
  sendMessage,
  getUnreadCount,
  markAsRead,
  getChatsWithUnread
};
