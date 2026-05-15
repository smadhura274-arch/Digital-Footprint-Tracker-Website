require('dotenv').config();

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/digital_footprint_tracker';
const JWT_SECRET =
  process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production_12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d';

module.exports = {
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,

  // Risk Levels
  RISK_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },

  // Auth Providers
  AUTH_PROVIDERS: {
    LOCAL: 'local',
    GOOGLE: 'google',
    GITHUB: 'github'
  },

  // Scan Status
  SCAN_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },

  // Social Platforms
  SOCIAL_PLATFORMS: [
    'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'google'
  ],

  // Default Privacy Score
  DEFAULT_PRIVACY_SCORE: 85,

  // Password Validation
  PASSWORD_MIN_LENGTH: 6,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
};
