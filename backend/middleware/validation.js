import { body, param, validationResult } from 'express-validator';

// Helper to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Discord username validation (supports both old and new format)
export const isValidDiscord = (value) => {
  // Old format: username#1234
  const oldFormat = /^.{3,32}#\d{4}$/;
  // New format: username (2-32 chars, can contain letters, numbers, underscores, periods)
  const newFormat = /^[a-zA-Z0-9_.]{2,32}$/;
  
  return oldFormat.test(value) || newFormat.test(value);
};

// Application validation
export const validateApplication = [
  body('gameNickname')
    .trim()
    .notEmpty().withMessage('Игровой ник обязателен')
    .isLength({ min: 3, max: 32 }).withMessage('Ник должен быть от 3 до 32 символов')
    .matches(/^[a-zA-Z0-9_\-\s]+$/).withMessage('Ник содержит недопустимые символы'),
  
  body('discordUsername')
    .trim()
    .notEmpty().withMessage('Discord обязателен')
    .custom(isValidDiscord).withMessage('Неверный формат Discord (username#1234 или username)'),
  
  body('age')
    .notEmpty().withMessage('Возраст обязателен')
    .isInt({ min: 16, max: 99 }).withMessage('Возраст должен быть от 16 до 99 лет'),
  
  body('rpExperience')
    .trim()
    .notEmpty().withMessage('Опыт в GTA RP обязателен')
    .isLength({ min: 10, max: 1000 }).withMessage('Опыт должен быть от 10 до 1000 символов'),
  
  body('previousFamilies')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Максимум 500 символов'),
  
  body('motivation')
    .trim()
    .notEmpty().withMessage('Мотивация обязательна')
    .isLength({ min: 50, max: 2000 }).withMessage('Мотивация должна быть от 50 до 2000 символов'),
  
  handleValidationErrors
];

// User registration validation
export const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Имя пользователя обязательно')
    .isLength({ min: 3, max: 30 }).withMessage('Имя должно быть от 3 до 30 символов')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Только буквы, цифры и подчеркивание'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email обязателен')
    .isEmail().withMessage('Неверный формат email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Пароль обязателен')
    .isLength({ min: 6, max: 100 }).withMessage('Пароль должен быть от 6 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Пароль должен содержать заглавную, строчную букву и цифру'),
  
  body('discordUsername')
    .trim()
    .notEmpty().withMessage('Discord обязателен')
    .custom(isValidDiscord).withMessage('Неверный формат Discord'),
  
  body('gameNickname')
    .trim()
    .notEmpty().withMessage('Игровой ник обязателен')
    .isLength({ min: 3, max: 32 }).withMessage('Ник должен быть от 3 до 32 символов'),
  
  body('age')
    .notEmpty().withMessage('Возраст обязателен')
    .isInt({ min: 16, max: 99 }).withMessage('Возраст должен быть от 16 до 99 лет'),
  
  body('applicationToken')
    .notEmpty().withMessage('Токен заявки обязателен'),
  
  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email обязателен')
    .isEmail().withMessage('Неверный формат email'),
  
  body('password')
    .notEmpty().withMessage('Пароль обязателен'),
  
  handleValidationErrors
];

// Message validation
export const validateMessage = [
  body('content')
    .trim()
    .notEmpty().withMessage('Сообщение не может быть пустым')
    .isLength({ min: 1, max: 2000 }).withMessage('Сообщение должно быть от 1 до 2000 символов'),
  
  handleValidationErrors
];

// Application status update validation
export const validateStatusUpdate = [
  body('status')
    .notEmpty().withMessage('Статус обязателен')
    .isIn(['pending', 'under_review', 'approved', 'rejected']).withMessage('Недопустимый статус'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Максимум 1000 символов'),
  
  handleValidationErrors
];

// User profile update validation
export const validateProfileUpdate = [
  body('discordUsername')
    .optional()
    .trim()
    .custom(isValidDiscord).withMessage('Неверный формат Discord'),
  
  body('gameNickname')
    .optional()
    .trim()
    .isLength({ min: 3, max: 32 }).withMessage('Ник должен быть от 3 до 32 символов'),
  
  body('age')
    .optional()
    .isInt({ min: 16, max: 99 }).withMessage('Возраст должен быть от 16 до 99 лет'),
  
  body('rpExperience')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Максимум 1000 символов'),
  
  handleValidationErrors
];

// ID parameter validation
export const validateId = [
  param('id')
    .notEmpty().withMessage('ID обязателен')
    .isMongoId().withMessage('Неверный формат ID'),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  body('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Страница должна быть числом больше 0'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100'),
  
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateApplication,
  validateRegister,
  validateLogin,
  validateMessage,
  validateStatusUpdate,
  validateProfileUpdate,
  validateId,
  validatePagination,
  isValidDiscord
};
