const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/database');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  return app(req, res);
};
