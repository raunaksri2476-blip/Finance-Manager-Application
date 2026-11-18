const mongoose = require('mongoose');

// Ensure all models are registered before DB connection / fallback setup
require('../models/User');
require('../models/Account');
require('../models/Category');
require('../models/Transaction');
require('../models/Budget');
require('../models/Goal');
require('../models/Notification');

const { ensureDemoUserSeeded } = require('../utils/seedHelper');
const { enableJsonFallback } = require('../utils/jsonFallback');

let isInitialized = false;

const connectDB = async () => {
  if (isInitialized) {
    return;
  }

  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_manager';
    console.log(`Connecting to MongoDB at ${connStr.replace(/\/\/.*@/, '//***@')}...`);

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000,
    });

    isInitialized = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await ensureDemoUserSeeded();
    return conn;
  } catch (error) {
    console.warn(`Local/Remote MongoDB unreachable (${error.message}). Switching to instant persistent JSON database engine...`);
    enableJsonFallback(mongoose);
    isInitialized = true;
    await ensureDemoUserSeeded();
  }
};

module.exports = connectDB;
