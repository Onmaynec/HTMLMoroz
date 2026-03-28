import { User, Application, Log, Notification } from '../models/index.js';
import { logger } from '../utils/logger.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    const newUsersThisWeek = await User.countDocuments({
      joinedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Application stats
    const applicationStats = await Application.getStats();
    const pendingApplications = await Application.countDocuments({
      status: { $in: ['pending', 'under_review'] }
    });

    // Recent activity
    const recentLogs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('actorId', 'username')
      .lean();

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          online: onlineUsers,
          newThisWeek: newUsersThisWeek
        },
        applications: {
          ...applicationStats,
          pending: pendingApplications
        },
        recentActivity: recentLogs
      }
    });
  } catch (error) {
    logger.error('GetDashboardStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики'
    });
  }
};

// Get all logs
export const getLogs = async (req, res) => {
  try {
    const {
      action,
      actorId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (actorId) filter.actorId = actorId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('actorId', 'username')
        .lean(),
      Log.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('GetLogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении логов'
    });
  }
};

// Send announcement to all users
export const sendAnnouncement = async (req, res) => {
  try {
    const { title, message, type = 'announcement' } = req.body;

    // Get all active users
    const users = await User.find({ status: 'active' }).select('_id');

    // Create notifications for all users
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type: 'announcement',
      actionLink: '/dashboard',
      actionText: 'Перейти'
    }));

    await Notification.insertMany(notifications);

    // Send real-time notifications
    const io = req.app.get('io');
    if (io) {
      io.emit('announcement', {
        title,
        message,
        sentAt: new Date()
      });
    }

    // Log action
    await Log.logAction({
      action: 'admin_action',
      actorId: req.userId,
      actorRole: 'admin',
      description: `Отправлено объявление: ${title}`,
      details: { recipientCount: users.length }
    });

    res.json({
      success: true,
      message: `Объявление отправлено ${users.length} пользователям`
    });
  } catch (error) {
    logger.error('SendAnnouncement error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отправке объявления'
    });
  }
};

// Get system status
export const getSystemStatus = async (req, res) => {
  try {
    // Database status
    const dbStatus = {
      connected: true,
      timestamp: new Date()
    };

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // Uptime
    const uptime = process.uptime();

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleStats = {};
    userStats.forEach(stat => {
      roleStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        database: dbStatus,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        uptime: Math.floor(uptime),
        users: roleStats,
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    logger.error('GetSystemStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статуса системы'
    });
  }
};

// Cleanup old data
export const cleanupOldData = async (req, res) => {
  try {
    const { days = 30, type = 'logs' } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let result = {};

    if (type === 'logs' || type === 'all') {
      const deletedLogs = await Log.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      result.logs = deletedLogs.deletedCount;
    }

    if (type === 'notifications' || type === 'all') {
      const deletedNotifications = await Notification.deleteMany({
        isRead: true,
        createdAt: { $lt: cutoffDate }
      });
      result.notifications = deletedNotifications.deletedCount;
    }

    // Log action
    await Log.logAction({
      action: 'admin_action',
      actorId: req.userId,
      actorRole: 'admin',
      description: `Очистка старых данных (${type}, ${days} дней)`,
      details: result
    });

    res.json({
      success: true,
      message: 'Очистка выполнена',
      data: result
    });
  } catch (error) {
    logger.error('CleanupOldData error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при очистке данных'
    });
  }
};

export default {
  getDashboardStats,
  getLogs,
  sendAnnouncement,
  getSystemStatus,
  cleanupOldData
};
