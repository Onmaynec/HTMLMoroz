import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Main authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный или истекший токен'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Ваш аккаунт заблокирован'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    // Update last active
    user.updateLastActive().catch(err => {
      logger.error('Error updating last active:', err);
    });

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при проверке авторизации'
    });
  }
};

// Optional authentication (doesn't require auth but attaches user if available)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.status !== 'banned') {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для выполнения этого действия'
      });
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Требуется авторизация'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Требуются права администратора'
    });
  }

  next();
};

// Socket.io authentication middleware
export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Требуется авторизация'));
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return next(new Error('Недействительный токен'));
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Пользователь не найден'));
    }

    if (user.status === 'banned') {
      return next(new Error('Аккаунт заблокирован'));
    }

    socket.user = user;
    socket.userId = user._id.toString();
    
    next();
  } catch (error) {
    logger.error('Socket auth error:', error);
    next(new Error('Ошибка авторизации'));
  }
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  requireAdmin,
  socketAuth,
  generateToken,
  verifyToken
};
