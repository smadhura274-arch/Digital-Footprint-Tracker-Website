const jwt = require('jsonwebtoken');
const User = require('../models/User');

const cleanEnvValue = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim();
  return normalized || fallback;
};

const getJwtSecret = () => cleanEnvValue(process.env.JWT_SECRET);
const getJwtExpiresIn = () => cleanEnvValue(process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN, '7d');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const jwtSecret = getJwtSecret();

      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const decoded = jwt.verify(token, jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.'
    });
  }
};

const generateToken = (id) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id }, jwtSecret, {
    expiresIn: getJwtExpiresIn()
  });
};

module.exports = { protect, generateToken };
