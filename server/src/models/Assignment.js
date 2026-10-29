const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    courseName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    due: {
      type: String,
      default: 'Next Week'
    },
    dueDate: {
      type: Date
    },
    points: {
      type: String,
      default: '100 pts'
    },
    status: {
      type: String,
      enum: ['Assigned', 'Due Soon', 'Completed', 'Graded'],
      default: 'Assigned'
    },
    createdBy: {
      type: String,
      default: 'Faculty'
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
