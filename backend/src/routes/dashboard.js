const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalScans = await Scan.countDocuments({ userId: req.user._id });

    const scans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    let totalRiskCount = 0;
    let totalScore = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;

    scans.forEach(scan => {
      totalRiskCount += scan.riskCount || 0;
      totalScore += scan.privacyScore || 85;
      if (scan.riskLevel === 'high') highRiskCount++;
      else if (scan.riskLevel === 'medium') mediumRiskCount++;
      else lowRiskCount++;
    });

    const avgPrivacyScore = scans.length > 0 ? Math.round(totalScore / scans.length) : 85;

    // Determine overall risk level
    let overallRiskLevel = 'low';
    if (highRiskCount > scans.length / 3) overallRiskLevel = 'high';
    else if (mediumRiskCount > scans.length / 3) overallRiskLevel = 'medium';

    // Count social accounts from latest scan
    let accountCount = 0;
    const latestScan = scans[0];
    if (latestScan && latestScan.socialHandles) {
      Object.values(latestScan.socialHandles).forEach(handle => {
        if (handle && handle.trim()) accountCount++;
      });
    }

    // Get recent activities
    const recentActivities = scans.slice(0, 5).map(scan => ({
      id: scan._id,
      type: 'scan',
      description: `Digital footprint scan completed with ${scan.totalFindings} findings`,
      date: scan.createdAt,
      privacyScore: scan.privacyScore,
      riskLevel: scan.riskLevel
    }));

    res.json({
      success: true,
      stats: {
        totalScans,
        totalRisks: totalRiskCount,
        socialAccountsTracked: accountCount,
        privacyScore: avgPrivacyScore,
        overallRiskLevel,
        riskDistribution: {
          low: lowRiskCount,
          medium: mediumRiskCount,
          high: highRiskCount
        }
      },
      recentActivities
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/trend
// @desc    Get privacy score trend for charts
// @access  Private
router.get('/trend', protect, async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .select('privacyScore createdAt');

    const trend = scans.map(scan => ({
      date: scan.createdAt,
      score: scan.privacyScore
    }));

    // Ensure at least 5 data points for charts
    while (trend.length < 5) {
      trend.unshift({
        date: new Date(Date.now() - (5 - trend.length) * 7 * 24 * 60 * 60 * 1000),
        score: 85
      });
    }

    res.json({
      success: true,
      trend
    });
  } catch (error) {
    console.error('Trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/dashboard/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.post('/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;