const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    usn: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'],
      default: 'Present'
    }
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    markedBy: {
      type: String,
      default: 'Faculty'
    },
    records: [attendanceRecordSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
