const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  socialHandles: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  findings: [{
    platform: { type: String, required: true },
    status: { type: String },
    risk: { type: String, enum: ['Low', 'Medium', 'High'] },
    details: { type: String },
    dataFound: { type: Array, default: [] }
  }],
  totalFindings: {
    type: Number,
    default: 0
  },
  riskCount: {
    type: Number,
    default: 0
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  privacyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  recommendations: [{
    type: String
  }],
  scanDuration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient queries
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ userId: 1, privacyScore: 1 });

module.exports = mongoose.model('Scan', scanSchema);