import { Log } from '../models/index.js';
import { logger } from '../utils/logger.js';

// Get all logs (admin only)
export const getAllLogs = async (req, res) => {
  try {
    const {
      action,
      actorId,
      targetType,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build filter
    const filter = {};
    if (action) filter.action = action;
    if (actorId) filter.actorId = actorId;
    if (targetType) filter.targetType = targetType;
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
        .populate('actorId', 'username role')
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
    logger.error('GetAllLogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении логов'
    });
  }
};

// Get log statistics
export const getLogStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const stats = await Log.getStats(parseInt(days));

    // Get action distribution
    const actionDistribution = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get daily activity
    const dailyActivity = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats,
        actionDistribution,
        dailyActivity
      }
    });
  } catch (error) {
    logger.error('GetLogStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики логов'
    });
  }
};

// Get recent activity for dashboard
export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('actorId', 'username avatar')
      .lean();

    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    logger.error('GetRecentActivity error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении активности'
    });
  }
};

export default {
  getAllLogs,
  getLogStats,
  getRecentActivity
};
