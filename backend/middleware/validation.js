const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const parkingValidation = [
  body('parkingName').notEmpty().withMessage('Parking name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('pricePerHour')
    .isFloat({ min: 0 })
    .withMessage('Price per hour must be a positive number'),
  body('totalSlots')
    .isInt({ min: 1 })
    .withMessage('Total slots must be at least 1'),
];

const bookingValidation = [
  body('parkingId').notEmpty().withMessage('Parking ID is required'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid ISO date'),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid ISO date'),
];

const reviewValidation = [
  body('parkingId').notEmpty().withMessage('Parking ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim(),
];

module.exports = {
  registerValidation,
  loginValidation,
  parkingValidation,
  bookingValidation,
  reviewValidation,
};
