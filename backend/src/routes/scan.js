const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { sendBreachAlertEmail } = require('../utils/mailer');
const { scanValidation } = require('../middleware/validation');
const { RISK_LEVELS, DEFAULT_PRIVACY_SCORE } = require('../config/constants');

// Helper function to calculate privacy score
function calculatePrivacyScore(findings) {
  let riskCount = 0;
  findings.forEach(finding => {
    if (finding.risk === 'High') riskCount += 25;
    else if (finding.risk === 'Medium') riskCount += 15;
    else riskCount += 5;
  });
  return Math.max(0, Math.min(100, 100 - riskCount));
}

// Helper function to determine risk level
function determineRiskLevel(score) {
  if (score < 50) return RISK_LEVELS.HIGH;
  if (score < 70) return RISK_LEVELS.MEDIUM;
  return RISK_LEVELS.LOW;
}

// Helper function to generate recommendations
function generateRecommendations(score, findings) {
  const recommendations = [];

  if (score < 70) {
    recommendations.push('Review and update privacy settings on all social media accounts');
  }

  if (findings.some(f => f.risk === 'High')) {
    recommendations.push('Remove personal contact information from public profiles immediately');
  }

  recommendations.push('Use stronger passwords and enable two-factor authentication');
  recommendations.push('Regularly review and delete old posts containing personal information');
  recommendations.push('Schedule monthly digital footprint scans for continuous monitoring');

  if (score < 60) {
    recommendations.push('Consider making your social media profiles private');
    recommendations.push('Remove location tags from photos and posts');
  }

  return recommendations;
}

// @route   POST /api/scan
// @desc    Perform a new digital footprint scan
// @access  Private
router.post('/', protect, scanValidation, async (req, res) => {
  try {
    const { socialHandles = {} } = req.body;

    // Simulate scan processing
    const findings = [];

    // Analyze each platform
    if (socialHandles.facebook && socialHandles.facebook.trim()) {
      findings.push({
        platform: 'Facebook',
        status: 'Profile Found',
        risk: 'Medium',
        details: `Profile "${socialHandles.facebook}" is publicly visible`,
        dataFound: ['profile picture', 'cover photo', 'public posts', 'friends list']
      });
    }

    if (socialHandles.twitter && socialHandles.twitter.trim()) {
      findings.push({
        platform: 'Twitter',
        status: 'Profile Found',
        risk: 'Low',
        details: `Tweets and profile information are visible to public`,
        dataFound: ['tweets', 'follower count', 'retweets', 'likes']
      });
    }

    if (socialHandles.instagram && socialHandles.instagram.trim()) {
      findings.push({
        platform: 'Instagram',
        status: 'Profile Found',
        risk: 'High',
        details: `Personal photos and location data may be visible`,
        dataFound: ['photos', 'location tags', 'follower list', 'stories']
      });
    }

    if (socialHandles.linkedin && socialHandles.linkedin.trim()) {
      findings.push({
        platform: 'LinkedIn',
        status: 'Profile Found',
        risk: 'Low',
        details: `Professional information and work history visible`,
        dataFound: ['work history', 'education', 'skills', 'recommendations']
      });
    }

    if (socialHandles.youtube && socialHandles.youtube.trim()) {
      findings.push({
        platform: 'YouTube',
        status: 'Channel Found',
        risk: 'Medium',
        details: `Channel content and subscriber information visible`,
        dataFound: ['video titles', 'subscriber count', 'playlists', 'comments']
      });
    }

    // Simulate Data Breach Check (e.g. searching HIBP database)
    const breachFound = Math.random() > 0.7; // 30% chance for simulation
    if (breachFound) {
      findings.push({
        platform: 'Global Breach Database',
        status: 'Breach Detected',
        risk: 'High',
        details: `Your email (${req.user.email}) was found in a historical data leak.`,
        dataFound: ['email', 'password hash', 'personal identity info']
      });
    }

    // Add Google search results
    const searchResultCount = Math.floor(Math.random() * 20) + 5;
    findings.push({
      platform: 'Google Search',
      status: 'Search Results Found',
      risk: 'Medium',
      details: `Found ${searchResultCount} search results containing your name across the web`,
      dataFound: ['search engine results', 'cached pages', 'image results']
    });

    const privacyScore = calculatePrivacyScore(findings);
    const riskLevel = determineRiskLevel(privacyScore);
    const recommendations = generateRecommendations(privacyScore, findings);

    const scan = await Scan.create({
      userId: req.user._id,
      socialHandles,
      findings,
      totalFindings: findings.length,
      riskCount: 100 - privacyScore,
      riskLevel,
      privacyScore,
      recommendations,
      scanDuration: Math.floor(Math.random() * 3000) + 2000,
      status: 'completed'
    });

    // Generate Notification for high-risk findings
    if (findings.some(f => f.risk === 'High')) {
      await Notification.create({
        userId: req.user._id,
        title: 'New Breach Detected',
        message: 'A recent scan discovered your credentials in a known data breach. Review your report immediately.',
        type: 'danger',
        relatedId: scan._id,
        onModel: 'Scan'
      });

      // Send Email Alert if user hasn't opted out in preferences
      if (req.user.preferences?.emailNotifications !== false) {
        try {
          await sendBreachAlertEmail({
            email: req.user.email,
            fullName: req.user.fullName,
            scanId: scan._id
          });
        } catch (emailError) {
          console.error('Failed to send breach alert email:', emailError);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Scan completed successfully',
      scan: {
        id: scan._id,
        privacyScore: scan.privacyScore,
        riskLevel: scan.riskLevel,
        totalFindings: scan.totalFindings,
        findings: scan.findings,
        recommendations: scan.recommendations,
        createdAt: scan.createdAt
      }
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during scan. Please try again.'
    });
  }
});

// @route   GET /api/scan/history
// @desc    Get scan history with pagination
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const scans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id privacyScore riskLevel totalFindings createdAt findings');

    const total = await Scan.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      scans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/scan/:id
// @desc    Get detailed scan results
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    res.json({
      success: true,
      scan
    });
  } catch (error) {
    console.error('Get scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/scan/:id
// @desc    Delete a scan record
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    res.json({
      success: true,
      message: 'Scan deleted successfully'
    });
  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;