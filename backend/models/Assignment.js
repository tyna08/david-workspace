const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  content: String,
  files: [String],
  grade: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  }
});

const assignmentSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    enum: ['maths', 'english', 'history', 'geography', 'biology', 'chemistry', 'physics']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded'],
    default: 'pending'
  },
  attachments: [String],
  submissions: [submissionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
