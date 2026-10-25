const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_manager';
    console.log(`Connecting to MongoDB at ${connStr}...`);
    
    // Attempt standard connection with short serverSelectionTimeoutMS
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Could not connect to local MongoDB server (${error.message}). Launching MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected via MongoMemoryServer: ${conn.connection.host}`);
      return conn;
    } catch (memError) {
      console.error(`MongoDB Memory Server launch failed: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
