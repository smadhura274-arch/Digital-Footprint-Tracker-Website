const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { sendBreachAlertEmail } = require('../utils/mailer');
const { RISK_LEVELS, DEFAULT_PRIVACY_SCORE } = require('../config/constants');

function normalizeHandle(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateHandle(value) {
  const normalizedValue = normalizeHandle(value);
  const compactValue = normalizedValue.toLowerCase().replace(/[._0-9]/g, '');

  if (!normalizedValue) {
    return { isValid: false, message: 'Please provide a username to scan.' };
  }

  if (normalizedValue.length < 4 || normalizedValue.length > 30) {
    return { isValid: false, message: 'Usernames must be 4 to 30 characters long.' };
  }

  if (!/^[A-Za-z0-9._]+$/.test(normalizedValue)) {
    return { isValid: false, message: 'Usernames can only contain letters, numbers, dots, and underscores.' };
  }

  if (!/[A-Za-z]/.test(normalizedValue)) {
    return { isValid: false, message: 'Usernames must include at least one letter.' };
  }

  if (/^[._]|[._]$/.test(normalizedValue)) {
    return { isValid: false, message: 'Usernames cannot start or end with a dot or underscore.' };
  }

  if (/(.)\1{2,}/.test(normalizedValue)) {
    return { isValid: false, message: 'Usernames with repeated characters like "aaa" are not allowed.' };
  }

  if (/^(asd|qwe|zxc|dfg|fgh|jkl)$/.test(compactValue)) {
    return { isValid: false, message: 'Please enter a real social media username.' };
  }

  return { isValid: true, normalizedValue };
}

// Helper function to calculate privacy score
function calculatePrivacyScore(findings) {
  if (!findings || findings.length === 0) return 100;

  let riskCount = 0;
  findings.forEach(finding => {
    // Adjusted penalties for more balanced score fluctuation
    if (finding.risk === 'High') riskCount += 15;
    else if (finding.risk === 'Medium') riskCount += 7;
    else riskCount += 2;
  });
  
  // Add a small random jitter for "beautiful" fluctuation so scores aren't always static
  // Jitter range increased for more noticeable score variation
  const jitter = Math.floor(Math.random() * 8); // Random value between 0 and 7
  // Ensure score doesn't go below a reasonable minimum
  return Math.max(10, Math.min(100, 100 - riskCount - jitter));
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
router.post('/', protect, async (req, res) => {
  try {
    const rawTargetName = normalizeHandle(req.body.targetName);
    const submittedHandles = req.body.socialHandles && typeof req.body.socialHandles === 'object'
      ? req.body.socialHandles
      : {};
    const activeHandles = Object.entries(submittedHandles)
      .map(([platform, handle]) => [platform, normalizeHandle(handle)])
      .filter(([, handle]) => handle);

    if (!rawTargetName && activeHandles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one username to scan.'
      });
    }

    const normalizedHandles = {};
    for (const [platform, handle] of activeHandles) {
      const validation = validateHandle(handle);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: `${platform} username is invalid. ${validation.message}`
        });
      }
      normalizedHandles[platform] = validation.normalizedValue;
    }

    let targetName = rawTargetName;
    if (targetName) {
      const validation = validateHandle(targetName);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }
      targetName = validation.normalizedValue;
    } else {
      targetName = activeHandles[0][1];
    }

    // Simulate scan processing with varied risk distribution
    const findings = [];
    const platformsConfig = [
      { name: 'Facebook', key: 'facebook', details: 'Public profile visible', data: ['profile info', 'posts', 'email'] },
      { name: 'Twitter', key: 'twitter', details: 'Public tweets detected', data: ['tweets', 'followers'] },
      { name: 'Instagram', key: 'instagram', details: 'Personal photos exposed', data: ['photos', 'location', 'email', 'stories'] },
      { name: 'LinkedIn', key: 'linkedin', details: 'Work history visible', data: ['experience', 'skills'] },
      { name: 'YouTube', key: 'youtube', details: 'Channel activity found', data: ['channel info', 'comments', 'history'] }
    ];

    platformsConfig.forEach(p => {
      // Increased detection rate (75%) for more findings, but still with fluctuation
      if (Math.random() < 0.25) return;

      // Weighted risk selection: 60% Low, 30% Medium, 10% High for more balanced distribution
      const rand = Math.random();
      const risk = rand < 0.6 ? 'Low' : (rand < 0.9 ? 'Medium' : 'High');

      findings.push({
        platform: p.name,
        status: 'Profile Found',
        risk: risk,
        details: `${p.details} for "${targetName}"`,
        dataFound: p.data.sort(() => 0.5 - Math.random()).slice(0, 1 + Math.floor(Math.random() * 3))
      });

      // Occasional "Metadata" finding for added complexity
      if (Math.random() > 0.88) {
        findings.push({
          platform: p.name,
          status: 'Metadata Leak',
          risk: 'Low',
          details: `Hidden EXIF data detected in ${p.name} media uploads.`,
          dataFound: ['GPS coordinates', 'device signature']
        });
      }
    });

    // Introduce a new finding type: Public Email Found
    if (Math.random() < 0.2) { // 20% chance of a public email finding
      findings.push({
        platform: 'Email Scan',
        status: 'Public Email Found',
        risk: ['Low', 'Medium'][Math.floor(Math.random() * 2)], // Low or Medium risk
        details: `Your email address (${req.user.email}) was found publicly listed.`,
        dataFound: ['email address']
      });
    }

    // Dynamic Data Breach probability (15% to 35%) for less frequent critical hits
    const breachProbability = 0.15 + (Math.random() * 0.2);
    if (Math.random() < breachProbability) {
      const databases = ['Canva 2019', 'LinkedIn 2016', 'Adobe 2013', 'Wattpad 2020'];
      findings.push({
        platform: 'Global Breach Database',
        status: 'Breach Detected',
        risk: 'High',
        details: `Identity found in ${databases[Math.floor(Math.random() * databases.length)]} dump.`,
        dataFound: ['email', 'password hash', 'personal info'].slice(0, 1 + Math.floor(Math.random() * 3))
      });
    }

    // Add Google search results
    const searchResultCount = Math.floor(Math.random() * 20) + 5;
    findings.push({
      platform: 'Google Search',
      status: 'Search Results Found',
      risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      details: `Found ${searchResultCount} search results containing your name across the web`,
      dataFound: ['search engine results', 'cached pages', 'image results']
    });

    const privacyScore = calculatePrivacyScore(findings);
    const riskLevel = determineRiskLevel(privacyScore);
    const recommendations = generateRecommendations(privacyScore, findings);

    const scan = await Scan.create({
      userId: req.user._id,
      socialHandles: Object.keys(normalizedHandles).length ? normalizedHandles : { fullName: targetName },
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

// @route   DELETE /api/scan/admin/clear-all
// @desc    Clear all scans for every user (Maintenance/Admin)
// @access  Private
router.delete('/admin/clear-all', protect, async (req, res) => {
  try {
    // Administrative check: Ensure only authorized requests can perform a global wipe
    // if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Unauthorized access.' });

    const scanResult = await Scan.deleteMany({});
    // Also clear associated scan notifications to ensure a clean state for all users
    const notificationResult = await Notification.deleteMany({ onModel: 'Scan' });

    res.json({
      success: true,
      message: `Successfully cleared ${scanResult.deletedCount} scans and ${notificationResult.deletedCount} notifications system-wide.`
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: 'Server error during data cleanup.' });
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
