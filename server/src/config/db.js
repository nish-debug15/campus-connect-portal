const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_connect';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 15000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('NOTE: If connecting to MongoDB Atlas, ensure 0.0.0.0/0 IP access is allowed and credentials are correct.');
    }
    return null;
  }
};

module.exports = connectDB;
