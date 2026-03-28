import { socketAuth } from '../middleware/auth.js';
import { User, Message, Notification } from '../models/index.js';
import { logger } from '../utils/logger.js';

// Store connected users
const connectedUsers = new Map();

export const initializeSocket = (io) => {
  // Apply authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.user.role;

    logger.info(`User connected: ${socket.user.username} (${userId})`);

    // Store user connection
    connectedUsers.set(userId, {
      socketId: socket.id,
      userId: userId,
      role: userRole,
      username: socket.user.username
    });

    // Update user's online status
    User.findByIdAndUpdate(userId, { isOnline: true, lastActive: new Date() })
      .catch(err => logger.error('Error updating online status:', err));

    // Join personal room for direct notifications
    socket.join(`user_${userId}`);

    // Join admin room if user is admin
    if (userRole === 'admin') {
      socket.join('admins');
    }

    // Join application chat room
    socket.on('join_application', (applicationId) => {
      socket.join(`application_${applicationId}`);
      logger.info(`User ${userId} joined application ${applicationId}`);
    });

    // Leave application chat room
    socket.on('leave_application', (applicationId) => {
      socket.leave(`application_${applicationId}`);
      logger.info(`User ${userId} left application ${applicationId}`);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { applicationId, isTyping } = data;
      socket.to(`application_${applicationId}`).emit('user_typing', {
        userId,
        username: socket.user.username,
        isTyping
      });
    });

    // Handle message read receipt
    socket.on('message_read', async (data) => {
      const { messageId, applicationId } = data;
      
      try {
        await Message.findByIdAndUpdate(messageId, {
          isRead: true,
          readAt: new Date(),
          readBy: userId
        });

        // Notify sender that message was read
        socket.to(`application_${applicationId}`).emit('message_read_receipt', {
          messageId,
          readBy: userId,
          readAt: new Date()
        });
      } catch (err) {
        logger.error('Error marking message as read:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${socket.user.username} (${userId})`);

      // Remove from connected users
      connectedUsers.delete(userId);

      // Update user's online status after a delay (to handle page refreshes)
      setTimeout(async () => {
        // Check if user reconnected
        if (!connectedUsers.has(userId)) {
          try {
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastActive: new Date()
            });

            // Notify admins that user went offline
            io.to('admins').emit('user_offline', {
              userId,
              username: socket.user.username
            });
          } catch (err) {
            logger.error('Error updating offline status:', err);
          }
        }
      }, 5000);
    });
  });

  // Helper function to send notification to specific user
  io.sendNotificationToUser = async (userId, notification) => {
    io.to(`user_${userId}`).emit('notification', { notification });
  };

  // Helper function to broadcast to admins
  io.broadcastToAdmins = (event, data) => {
    io.to('admins').emit(event, data);
  };

  // Helper function to get online users count
  io.getOnlineUsersCount = () => {
    return connectedUsers.size;
  };

  // Helper function to check if user is online
  io.isUserOnline = (userId) => {
    return connectedUsers.has(userId);
  };
};

export default { initializeSocket };
