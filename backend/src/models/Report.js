const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan'
  },
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  totalScans: {
    type: Number,
    default: 0
  },
  averagePrivacyScore: {
    type: Number,
    default: 0
  },
  totalFindings: {
    type: Number,
    default: 0
  },
  overallRiskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  recommendations: [{
    type: String
  }],
  scoreTrend: [{
    date: Date,
    score: Number
  }],
  pdfUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);