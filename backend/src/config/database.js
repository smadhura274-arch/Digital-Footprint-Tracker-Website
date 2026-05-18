const mongoose = require('mongoose');
const { MONGODB_URI } = require('./constants');

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    connectionPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
    });
    const conn = await connectionPromise;

    const connectionType = connectDB.isAtlasUri(MONGODB_URI) ? 'MongoDB Atlas' : 'MongoDB';
    console.log(`${connectionType} connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected.');
    });

    return conn;
  } catch (error) {
    connectionPromise = null;
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

connectDB.isAtlasUri = (uri) =>
  typeof uri === 'string' &&
  (uri.startsWith('mongodb+srv://') || uri.includes('.mongodb.net'));

module.exports = connectDB;
