const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student'
    },
    usn: {
      type: String,
      default: null,
      trim: true
    },
    branch: {
      type: String,
      default: null
    },
    year: {
      type: String,
      default: null
    },
    empId: {
      type: String,
      default: null,
      trim: true
    },
    department: {
      type: String,
      default: null
    },
    profilePhoto: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
