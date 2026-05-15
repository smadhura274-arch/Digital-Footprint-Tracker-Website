const nodemailer = require('nodemailer');

let cachedTransporter = null;

const createTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return cachedTransporter;
};

const sendOtpEmail = async ({ email, fullName, otp, purpose }) => {
  const transporter = await createTransporter();

  if (!transporter) {
    return {
      delivered: false,
      previewOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    };
  }

  const recipientName = fullName || 'there';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const actionCopy = purpose === 'signup' ? 'complete your sign up' : 'finish signing in';

  await transporter.sendMail({
    from,
    to: email,
    subject: `Your Digital Footprint Tracker OTP: ${otp}`,
    text: `Hi ${recipientName}, your OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fffaf1;border:1px solid #eadcc3;border-radius:20px;color:#2f241b">
        <p style="margin:0 0 12px">Hi ${recipientName},</p>
        <p style="margin:0 0 18px">Use this one-time password to ${actionCopy}.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:16px 20px;background:#f3e4c5;border-radius:16px;text-align:center;color:#7b4b2a">
          ${otp}
        </div>
        <p style="margin:18px 0 0">This code expires in 10 minutes.</p>
      </div>
    `
  });

  return { delivered: true };
};

const sendBreachAlertEmail = async ({ email, fullName, scanId }) => {
  const transporter = await createTransporter();

  if (!transporter) {
    return { delivered: false };
  }

  const recipientName = fullName || 'there';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/dashboard.html`;

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Security Alert: Privacy Breach Detected',
    text: `Hi ${recipientName}, our scanners have detected a high-risk privacy breach in your latest scan. Please review your dashboard immediately.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff5f5;border:1px solid #feb2b2;border-radius:20px;color:#2d3748">
        <h2 style="color:#c53030;margin-top:0">Security Alert</h2>
        <p style="margin:0 0 12px">Hi ${recipientName},</p>
        <p style="margin:0 0 18px">Our automated scanners have detected that your credentials or personal information appeared in a known data breach during your most recent scan.</p>
        <div style="margin:24px 0;text-align:center">
          <a href="${dashboardUrl}" style="background:#c53030;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Review Breach Details</a>
        </div>
        <p style="margin:18px 0 0;font-size:14px;color:#718096">This scan was performed on your behalf to help protect your digital footprint. If you didn't request this, please secure your account.</p>
      </div>
    `
  });

  return { delivered: true };
};

module.exports = {
  sendOtpEmail,
  sendBreachAlertEmail
};
