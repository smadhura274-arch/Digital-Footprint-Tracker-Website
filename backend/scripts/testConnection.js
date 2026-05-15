require('dotenv').config();

const mongoose = require('mongoose');
const connectDatabase = require('../src/config/database');
const { MONGODB_URI } = require('../src/config/constants');

const testConnection = async () => {
  try {
    await connectDatabase();

    const connection = mongoose.connection;
    console.log('MongoDB connection test passed.');
    console.log(`Host: ${connection.host}`);
    console.log(`Database: ${connection.name}`);
    console.log(
      `Connection type: ${connectDatabase.isAtlasUri(MONGODB_URI) ? 'MongoDB Atlas' : 'Local MongoDB'}`
    );
  } catch (error) {
    console.error(`MongoDB connection test failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

testConnection();
