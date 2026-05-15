const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');

// @route   GET /api/report/generate
// @desc    Generate comprehensive privacy report
// @access  Private
router.get('/generate', protect, async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    if (scans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No scans found. Please run a scan first.'
      });
    }

    // Calculate statistics
    let totalScore = 0;
    let totalFindings = 0;
    let riskDistribution = { low: 0, medium: 0, high: 0 };
    let platformExposure = {};

    scans.forEach(scan => {
      totalScore += scan.privacyScore;
      totalFindings += scan.totalFindings;
      riskDistribution[scan.riskLevel]++;

      // Count platform occurrences
      scan.findings.forEach(f => {
        platformExposure[f.platform] = (platformExposure[f.platform] || 0) + 1;
      });
    });

    const avgScore = Math.round(totalScore / scans.length);
    const overallRisk = riskDistribution.high > scans.length / 2 ? 'High' :
      (riskDistribution.high > 0 || riskDistribution.medium > scans.length / 2 ? 'Medium' : 'Low');

    // Generate personalized recommendations
    const recommendations = [];
    if (avgScore < 70) {
      recommendations.push('URGENT: Immediately review and tighten privacy settings on all platforms');
    }
    recommendations.push('Enable two-factor authentication on all accounts');
    recommendations.push('Regularly audit third-party app permissions');
    recommendations.push('Use a password manager for unique, strong passwords');
    recommendations.push('Opt out of data broker sites and people search websites');

    if (avgScore < 60) {
      recommendations.push('Consider deleting old social media accounts you no longer use');
    }

    // Score trend for charts
    const scoreTrend = scans.slice().reverse().map(scan => ({
      date: scan.createdAt,
      score: scan.privacyScore
    }));

    const report = {
      title: `Privacy Report - ${new Date().toLocaleDateString()}`,
      summary: `Based on ${scans.length} digital footprint scan(s), your overall privacy score is ${avgScore}/100. ${avgScore >= 80 ? 'Great job maintaining your privacy!' : (avgScore >= 60 ? 'Good progress, but there is room for improvement.' : 'Immediate action is recommended to protect your online privacy.')}`,
      totalScans: scans.length,
      averagePrivacyScore: avgScore,
      totalFindings,
      overallRiskLevel: overallRisk,
      riskDistribution,
      platformExposure,
      recommendations,
      scoreTrend,
      scanHistory: scans.slice(0, 10).map(scan => ({
        id: scan._id,
        date: scan.createdAt,
        privacyScore: scan.privacyScore,
        riskLevel: scan.riskLevel,
        totalFindings: scan.totalFindings
      }))
    };

    // Save report to database for history
    const savedReport = await Report.create({
      userId: req.user._id,
      title: report.title,
      summary: report.summary,
      totalScans: report.totalScans,
      averagePrivacyScore: report.averagePrivacyScore,
      totalFindings: report.totalFindings,
      overallRiskLevel: report.overallRiskLevel,
      recommendations: report.recommendations,
      scoreTrend: report.scoreTrend
    });

    res.json({
      success: true,
      report,
      reportId: savedReport._id
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/report/history
// @desc    Get report generation history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Report history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/report/:id
// @desc    Get specific report by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;