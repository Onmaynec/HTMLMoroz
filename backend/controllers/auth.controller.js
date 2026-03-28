import bcrypt from 'bcryptjs';
import { User, Application, Log } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';
import { logger, logUserAction } from '../utils/logger.js';

// Register new user (after application approval)
export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      discordUsername,
      gameNickname,
      age,
      applicationToken
    } = req.body;

    // Verify application token (should be the application ID)
    const application = await Application.findById(applicationToken);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    if (application.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Регистрация доступна только после одобрения заявки'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username },
        { discordUsername }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким email, ником или Discord уже существует'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      discordUsername,
      gameNickname,
      age,
      role: 'member',
      status: 'active',
      applicationId: application._id,
      rpExperience: application.rpExperience,
      previousFamilies: application.previousFamilies
    });

    await user.save();

    // Update application with user reference
    application.userId = user._id;
    await application.save();

    // Log action
    await Log.logAction({
      action: 'user_register',
      actorId: user._id,
      actorRole: 'member',
      targetId: user._id,
      targetType: 'User',
      description: `Пользователь ${username} зарегистрировался`,
      details: { email, discordUsername }
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          gameNickname: user.gameNickname,
          discordUsername: user.discordUsername
        },
        token
      }
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при регистрации'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Check status
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Ваш аккаунт заблокирован'
      });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Ваш аккаунт ожидает активации'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Update online status
    user.isOnline = true;
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Log action
    await Log.logAction({
      action: 'user_login',
      actorId: user._id,
      actorRole: user.role,
      targetId: user._id,
      targetType: 'User',
      description: `Пользователь ${user.username} вошел в систему`,
      details: { ip: req.ip }
    });

    res.json({
      success: true,
      message: 'Вход успешен',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          gameNickname: user.gameNickname,
          discordUsername: user.discordUsername,
          isOnline: user.isOnline,
          joinedAt: user.joinedAt
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при входе'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user) {
      user.isOnline = false;
      await user.save({ validateBeforeSave: false });

      // Log action
      await Log.logAction({
        action: 'user_logout',
        actorId: user._id,
        actorRole: user.role,
        targetId: user._id,
        targetType: 'User',
        description: `Пользователь ${user.username} вышел из системы`
      });
    }

    res.json({
      success: true,
      message: 'Выход успешен'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при выходе'
    });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('applicationId', 'status submittedAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          gameNickname: user.gameNickname,
          discordUsername: user.discordUsername,
          age: user.age,
          rpExperience: user.rpExperience,
          previousFamilies: user.previousFamilies,
          status: user.status,
          isOnline: user.isOnline,
          lastActive: user.lastActive,
          joinedAt: user.joinedAt,
          application: user.applicationId
        }
      }
    });
  } catch (error) {
    logger.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении данных пользователя'
    });
  }
};

// Check if application is approved (for registration)
export const checkApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    // Check if user already registered
    const existingUser = await User.findOne({ applicationId: application._id });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь уже зарегистрирован по этой заявке'
      });
    }

    res.json({
      success: true,
      data: {
        status: application.status,
        canRegister: application.status === 'approved',
        gameNickname: application.gameNickname,
        discordUsername: application.discordUsername
      }
    });
  } catch (error) {
    logger.error('CheckApplication error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при проверке заявки'
    });
  }
};

export default {
  register,
  login,
  logout,
  getMe,
  checkApplication
};
