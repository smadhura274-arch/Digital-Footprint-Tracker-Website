const jwt = require("jsonwebtoken");
const { JWT_EXPIRES_IN, JWT_SECRET } = require("../config/constants");

const createToken = (user) => {
  return jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

const calculateRiskScore = (findings = []) => {
  const weights = {
    low: 8,
    medium: 18,
    high: 32
  };

  const risk = findings.reduce((total, finding) => {
    return total + (weights[finding.riskLevel] || weights.low);
  }, 0);

  return Math.max(0, Math.min(100, 100 - risk));
};

module.exports = {
  calculateRiskScore,
  createToken
};
