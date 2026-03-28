import { Application, User, Notification, Log } from '../models/index.js';
import { logger } from '../utils/logger.js';

// Create new application
export const createApplication = async (req, res) => {
  try {
    const {
      gameNickname,
      discordUsername,
      age,
      rpExperience,
      previousFamilies,
      motivation
    } = req.body;

    // Check for existing pending application with same discord
    const existingApp = await Application.findOne({
      discordUsername: discordUsername.toLowerCase(),
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: 'У вас уже есть активная заявка на рассмотрении'
      });
    }

    // Check if user with this discord already exists
    const existingUser = await User.findOne({
      discordUsername: discordUsername.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким Discord уже зарегистрирован'
      });
    }

    // Create application
    const application = new Application({
      gameNickname,
      discordUsername: discordUsername.toLowerCase(),
      age,
      rpExperience,
      previousFamilies: previousFamilies || '',
      motivation,
      ipAddress: req.ip
    });

    await application.save();

    // Log action
    await Log.logAction({
      action: 'application_create',
      actorRole: 'guest',
      targetId: application._id,
      targetType: 'Application',
      description: `Создана новая заявка от ${gameNickname}`,
      details: { discordUsername, age }
    });

    // Notify admins (will be implemented with socket.io)
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('new_application', {
        applicationId: application._id,
        gameNickname: application.gameNickname,
        discordUsername: application.discordUsername,
        submittedAt: application.submittedAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Заявка успешно отправлена',
      data: {
        application: {
          id: application._id,
          gameNickname: application.gameNickname,
          status: application.status,
          submittedAt: application.submittedAt
        }
      }
    });
  } catch (error) {
    logger.error('CreateApplication error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании заявки'
    });
  }
};

// Get all applications (admin only)
export const getAllApplications = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reviewedBy', 'username')
        .lean(),
      Application.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('GetAllApplications error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении заявок'
    });
  }
};

// Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('reviewedBy', 'username avatar')
      .populate('userId', 'username avatar');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    // Check permissions
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && application.userId && 
      application.userId._id.toString() === req.userId.toString();

    // For non-admins, only allow viewing their own approved application
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав'
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    logger.error('GetApplicationById error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении заявки'
    });
  }
};

// Update application status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    const oldStatus = application.status;

    // Update status
    await application.updateStatus(status, req.userId, notes);

    // Log action
    await Log.logAction({
      action: `application_${status}`,
      actorId: req.userId,
      actorRole: 'admin',
      targetId: application._id,
      targetType: 'Application',
      description: `Заявка ${application.gameNickname} ${status === 'approved' ? 'одобрена' : 'отклонена'}`,
      details: { oldStatus, newStatus: status, notes }
    });

    // Create notification for applicant (if they have a user account)
    if (application.userId) {
      const notification = new Notification({
        userId: application.userId,
        title: status === 'approved' ? 'Заявка одобрена!' : 'Заявка отклонена',
        message: status === 'approved' 
          ? 'Ваша заявка была одобрена. Теперь вы можете зарегистрироваться.'
          : `Ваша заявка была отклонена. ${notes || ''}`,
        type: status === 'approved' ? 'application_approved' : 'application_rejected',
        relatedId: application._id,
        relatedType: 'Application'
      });
      await notification.save();

      // Send real-time notification
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${application.userId}`).emit('notification', {
          notification: await notification.populate('relatedId')
        });
      }
    }

    // Notify admins about status change
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('application_status_changed', {
        applicationId: application._id,
        oldStatus,
        newStatus: status,
        updatedBy: req.user.username
      });
    }

    res.json({
      success: true,
      message: `Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}`,
      data: { application }
    });
  } catch (error) {
    logger.error('UpdateStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении статуса'
    });
  }
};

// Get application statistics
export const getStats = async (req, res) => {
  try {
    const stats = await Application.getStats();
    
    // Get additional stats
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentApplications = await Application.countDocuments({
      submittedAt: { $gte: last7Days }
    });

    const pendingReview = await Application.countDocuments({
      status: { $in: ['pending', 'under_review'] }
    });

    res.json({
      success: true,
      data: {
        ...stats,
        recentApplications,
        pendingReview
      }
    });
  } catch (error) {
    logger.error('GetStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики'
    });
  }
};

// Get my application (for applicants checking status)
export const getMyApplication = async (req, res) => {
  try {
    const { discordUsername } = req.params;

    // Normalize discord username
    const normalizedDiscord = discordUsername.toLowerCase();

    const application = await Application.findOne({
      discordUsername: normalizedDiscord
    })
    .sort({ submittedAt: -1 })
    .populate('reviewedBy', 'username')
    .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    // Return limited info for public access
    res.json({
      success: true,
      data: {
        application: {
          id: application._id,
          gameNickname: application.gameNickname,
          status: application.status,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt,
          reviewNotes: application.rejectionReason || application.reviewNotes,
          canRegister: application.status === 'approved' && !application.userId
        }
      }
    });
  } catch (error) {
    logger.error('GetMyApplication error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении заявки'
    });
  }
};

export default {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateStatus,
  getStats,
  getMyApplication
};
