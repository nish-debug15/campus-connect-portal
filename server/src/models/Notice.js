const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    courseName: {
      type: String,
      default: 'General Announcement'
    },
    description: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    postedBy: {
      type: String,
      default: 'Faculty'
    },
    priority: {
      type: String,
      enum: ['Academic Circular', 'Urgent Notice', 'University Event', 'Campus Facilities', 'Announcement'],
      default: 'Announcement'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notice', noticeSchema);
