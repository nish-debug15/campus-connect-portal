const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      default: 'Section A'
    },
    room: {
      type: String,
      default: 'Lab 402'
    },
    schedule: {
      type: String,
      default: 'Mon, Wed 10:00 AM'
    },
    faculty: {
      type: String,
      default: 'Dr. Ramesh Kumar'
    },
    enrollmentCode: {
      type: String,
      default: ''
    },
    enrolledStudents: {
      type: Number,
      default: 40
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Course', courseSchema);
