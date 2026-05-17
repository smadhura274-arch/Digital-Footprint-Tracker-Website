const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const signupValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail()
    .notEmpty().withMessage('Email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  body('captchaToken')
    .trim()
    .notEmpty().withMessage('CAPTCHA challenge is required'),
  body('captchaResponse')
    .trim()
    .isLength({ min: 4, max: 8 }).withMessage('Enter the CAPTCHA code shown in the image'),
  validateRequest
];

const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  body('captchaToken')
    .trim()
    .notEmpty().withMessage('CAPTCHA challenge is required'),
  body('captchaResponse')
    .trim()
    .isLength({ min: 4, max: 8 }).withMessage('Enter the CAPTCHA code shown in the image'),
  validateRequest
];

const scanValidation = [
  body('socialHandles')
    .optional()
    .isObject().withMessage('Social handles must be an object'),
  validateRequest
];

module.exports = {
  validateRequest,
  signupValidation,
  loginValidation,
  scanValidation
};
