const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const { signupValidation, loginValidation, validateRequest } = require('../middleware/validation');
const { createChallenge, consumeChallenge, getChallenge, OTP_TTL_MS } = require('../utils/otpStore');
const { sendOtpEmail } = require('../utils/mailer');
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const requireStripe = (res) => {
  if (stripe) {
    return true;
  }

  res.status(503).json({
    success: false,
    message: 'Payments are not configured on this server.'
  });
  return false;
};

const signupOtpRequestValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail()
    .notEmpty().withMessage('Email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  validateRequest
];

const otpVerificationValidation = [
  body('challengeId')
    .trim()
    .notEmpty().withMessage('Challenge ID is required'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
  validateRequest
];

const buildOtpResponse = (message, challengeId, mailResult) => ({
  success: true,
  message,
  challengeId,
  expiresInMinutes: Math.floor(OTP_TTL_MS / 60000),
  previewOtp: mailResult.previewOtp
});

// @route   POST /api/auth/signup/request-otp
// @desc    Send signup OTP
// @access  Public
router.post('/signup/request-otp', signupOtpRequestValidation, async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    const { challengeId, otp } = createChallenge('signup', {
      fullName: fullName.trim(),
      email: normalizedEmail,
      password
    });

    const mailResult = await sendOtpEmail({
      email: normalizedEmail,
      fullName: fullName.trim(),
      otp,
      purpose: 'signup'
    });

    res.json(buildOtpResponse('OTP sent to your email', challengeId, mailResult));
  } catch (error) {
    console.error('Signup OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send OTP. Please try again later.'
    });
  }
});

// @route   POST /api/auth/signup/verify-otp
// @desc    Verify signup OTP and create user
// @access  Public
router.post('/signup/verify-otp', otpVerificationValidation, async (req, res) => {
  try {
    const { challengeId, otp } = req.body;
    const result = consumeChallenge(challengeId, 'signup', otp);

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.reason === 'mismatch' ? 'Invalid OTP code' : 'OTP expired or invalid'
      });
    }

    const { fullName, email, password } = result.payload;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      authProvider: 'local',
      emailVerified: true
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Signup OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signupValidation, async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      authProvider: 'local',
      emailVerified: false
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/auth/login/request-otp
// @desc    Validate credentials and send login OTP
// @access  Public
router.post('/login/request-otp', loginValidation, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    const { challengeId, otp } = createChallenge('login', {
      userId: user._id.toString(),
      rememberMe: Boolean(rememberMe)
    });

    const mailResult = await sendOtpEmail({
      email: user.email,
      fullName: user.fullName,
      otp,
      purpose: 'login'
    });

    res.json(buildOtpResponse('OTP sent to your email', challengeId, mailResult));
  } catch (error) {
    console.error('Login OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send OTP. Please try again later.'
    });
  }
});

// @route   POST /api/auth/login/verify-otp
// @desc    Verify login OTP and create session token
// @access  Public
router.post('/login/verify-otp', otpVerificationValidation, async (req, res) => {
  try {
    const { challengeId, otp } = req.body;
    const result = consumeChallenge(challengeId, 'login', otp);

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.reason === 'mismatch' ? 'Invalid OTP code' : 'OTP expired or invalid'
      });
    }

    const { userId, rememberMe } = result.payload;
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is unavailable. Please login again.'
      });
    }

    await user.updateLastLogin();

    const tokenExpire = rememberMe ? '30d' : process.env.JWT_EXPIRE;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: tokenExpire
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Login OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    await user.updateLastLogin();
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user.getPublicProfile()
  });
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, bio, preferences } = req.body;

    if (fullName) {
      req.user.fullName = fullName.trim();
    }

    if (bio !== undefined) {
      req.user.bio = bio.trim();
    }

    if (preferences) {
      req.user.preferences = { ...req.user.preferences, ...preferences };
    }

    req.user.updatedAt = new Date();
    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/create-checkout-session
// @desc    Create Stripe Checkout Session for Premium
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    if (!requireStripe(res)) {
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Privacy Guardian Premium',
            description: 'Unlock deep scans and priority alerts',
          },
          unit_amount: 1999, // $19.99
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: req.user.email,
      success_url: `${req.headers.origin}/pages/payment-success.html`,
      cancel_url: `${req.headers.origin}/pages/payment-cancel.html`,
      metadata: { userId: req.user._id.toString() }
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not initiate payment'
    });
  }
});

// @route   PUT /api/auth/upgrade-premium
// @desc    Upgrade user to premium
// @access  Private
router.put('/upgrade-premium', protect, async (req, res) => {
  try {
    req.user.isPremium = true;
    req.user.updatedAt = new Date();
    await req.user.save();

    res.json({
      success: true,
      message: 'Successfully upgraded to Premium!',
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Upgrade premium error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/webhook
// @desc    Stripe webhook handler to securely verify payment
// @access  Public (Stripe signature required)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Payments are not configured on this server.'
    });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify that the request is genuinely from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Securely handle successful payment completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    try {
      const user = await User.findById(userId);
      if (user) {
        user.isPremium = true;
        user.updatedAt = new Date();
        await user.save();
        console.log(`User ${userId} successfully upgraded via verified webhook.`);
      }
    } catch (dbErr) {
      console.error('Database update error during webhook:', dbErr);
    }
  }

  res.json({ received: true });
});

module.exports = router;
