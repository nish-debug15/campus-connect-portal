const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true
    },
    studentUsn: {
      type: String,
      default: ''
    },
    submissionText: {
      type: String,
      default: ''
    },
    submissionLink: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Submitted', 'Graded', 'Returned'],
      default: 'Submitted'
    },
    grade: {
      type: String,
      default: null
    },
    feedback: {
      type: String,
      default: null
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Submission', submissionSchema);
