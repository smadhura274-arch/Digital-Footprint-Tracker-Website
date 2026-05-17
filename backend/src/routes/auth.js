const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const { signupValidation, loginValidation } = require('../middleware/validation');
const { generateCaptchaChallenge, verifyCaptchaChallenge } = require('../utils/captcha');
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

const requireValidCaptcha = (req, res) => {
  const { captchaToken, captchaResponse } = req.body;

  if (!captchaToken || !captchaResponse) {
    res.status(400).json({
      success: false,
      message: 'Complete the CAPTCHA challenge before continuing.'
    });
    return false;
  }

  if (!verifyCaptchaChallenge(captchaToken, captchaResponse)) {
    res.status(400).json({
      success: false,
      message: 'CAPTCHA verification failed. Please try again.'
    });
    return false;
  }

  return true;
};

// @route   GET /api/auth/captcha
// @desc    Generate a new CAPTCHA challenge
// @access  Public
router.get('/captcha', (req, res) => {
  const challenge = generateCaptchaChallenge();

  res.json({
    success: true,
    ...challenge
  });
});

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signupValidation, async (req, res) => {
  try {
    if (!requireValidCaptcha(req, res)) {
      return;
    }

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
    console.error('Signup error:', error);
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
    if (!requireValidCaptcha(req, res)) {
      return;
    }

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
