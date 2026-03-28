import { User, Log } from '../models/index.js';
import { deleteOldAvatar } from '../middleware/upload.js';
import { logger } from '../utils/logger.js';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      isOnline,
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (isOnline !== undefined) filter.isOnline = isOnline === 'true';
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { gameNickname: { $regex: search, $options: 'i' } },
        { discordUsername: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('GetAllUsers error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении пользователей'
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password')
      .populate('applicationId', 'status submittedAt reviewedAt')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('GetUserById error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении пользователя'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { discordUsername, gameNickname, age, rpExperience } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Check for duplicate discord if changed
    if (discordUsername && discordUsername !== user.discordUsername) {
      const existing = await User.findOne({
        discordUsername: discordUsername.toLowerCase(),
        _id: { $ne: user._id }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Этот Discord уже используется'
        });
      }
    }

    // Update fields
    if (discordUsername) user.discordUsername = discordUsername;
    if (gameNickname) user.gameNickname = gameNickname;
    if (age) user.age = age;
    if (rpExperience !== undefined) user.rpExperience = rpExperience;

    await user.save();

    // Log action
    await Log.logAction({
      action: 'user_update',
      actorId: user._id,
      actorRole: user.role,
      targetId: user._id,
      targetType: 'User',
      description: `Пользователь ${user.username} обновил профиль`
    });

    res.json({
      success: true,
      message: 'Профиль обновлен',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          discordUsername: user.discordUsername,
          gameNickname: user.gameNickname,
          age: user.age,
          rpExperience: user.rpExperience,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    logger.error('UpdateProfile error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении профиля'
    });
  }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не загружен'
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      // Delete uploaded file
      req.file && deleteOldAvatar(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Delete old avatar
    if (user.avatar) {
      await deleteOldAvatar(user.avatar);
    }

    // Update avatar path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    // Log action
    await Log.logAction({
      action: 'user_update',
      actorId: user._id,
      actorRole: user.role,
      targetId: user._id,
      targetType: 'User',
      description: `Пользователь ${user.username} обновил аватар`
    });

    res.json({
      success: true,
      message: 'Аватар обновлен',
      data: { avatar: avatarUrl }
    });
  } catch (error) {
    // Delete uploaded file on error
    req.file && deleteOldAvatar(req.file.path);
    logger.error('UploadAvatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при загрузке аватара'
    });
  }
};

// Change user role (admin only)
export const changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log action
    await Log.logAction({
      action: 'role_change',
      actorId: req.userId,
      actorRole: 'admin',
      targetId: user._id,
      targetType: 'User',
      description: `Роль пользователя ${user.username} изменена с ${oldRole} на ${role}`,
      details: { oldRole, newRole: role }
    });

    res.json({
      success: true,
      message: `Роль изменена на ${role}`,
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('ChangeRole error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при изменении роли'
    });
  }
};

// Ban/unban user (admin only)
export const toggleBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Prevent self-ban
    if (user._id.toString() === req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Нельзя заблокировать самого себя'
      });
    }

    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    user.status = newStatus;
    await user.save();

    // Log action
    await Log.logAction({
      action: newStatus === 'banned' ? 'user_ban' : 'user_unban',
      actorId: req.userId,
      actorRole: 'admin',
      targetId: user._id,
      targetType: 'User',
      description: `Пользователь ${user.username} ${newStatus === 'banned' ? 'заблокирован' : 'разблокирован'}`,
      details: { reason }
    });

    res.json({
      success: true,
      message: `Пользователь ${newStatus === 'banned' ? 'заблокирован' : 'разблокирован'}`,
      data: {
        user: {
          id: user._id,
          username: user.username,
          status: user.status
        }
      }
    });
  } catch (error) {
    logger.error('ToggleBan error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при изменении статуса'
    });
  }
};

// Get online users
export const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ isOnline: true })
      .select('username avatar gameNickname lastActive')
      .lean();

    res.json({
      success: true,
      data: { users, count: users.length }
    });
  } catch (error) {
    logger.error('GetOnlineUsers error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении онлайн пользователей'
    });
  }
};

// Get user statistics
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const memberCount = await User.countDocuments({ role: 'member' });
    const pendingCount = await User.countDocuments({ role: 'pending' });
    const bannedCount = await User.countDocuments({ status: 'banned' });

    // New users this week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newThisWeek = await User.countDocuments({ joinedAt: { $gte: lastWeek } });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        online: onlineUsers,
        admins: adminCount,
        members: memberCount,
        pending: pendingCount,
        banned: bannedCount,
        newThisWeek
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
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении профиля'
    });
  }
};