const mongoose = require('mongoose');
const { MONGODB_URI } = require('./constants');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
    });

    const connectionType = connectDB.isAtlasUri(MONGODB_URI) ? 'MongoDB Atlas' : 'MongoDB';
    console.log(`${connectionType} connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected.');
    });
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

connectDB.isAtlasUri = (uri) =>
  typeof uri === 'string' &&
  (uri.startsWith('mongodb+srv://') || uri.includes('.mongodb.net'));

module.exports = connectDB;
