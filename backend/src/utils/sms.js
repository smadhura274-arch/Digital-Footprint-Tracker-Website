/**
 * sms.js
 * Mock SMS utility for development.
 */

async function sendOtpSms({ phone, otp, purpose }) {
  console.log(`[SMS] Sending OTP ${otp} to ${phone} for ${purpose}`);
  
  // In a real app, you'd use Twilio, AWS SNS, etc.
  return {
    success: true,
    messageId: `mock-sms-${Date.now()}`,
    previewOtp: otp // Return for development UI preview
  };
}

module.exports = {
  sendOtpSms
};
