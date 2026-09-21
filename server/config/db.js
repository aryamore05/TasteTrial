const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS resolution for MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Use system default if setting servers is not permitted
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB Atlas] Connected: ${conn.connection.host}`);
    console.log(`[MongoDB Database]: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
