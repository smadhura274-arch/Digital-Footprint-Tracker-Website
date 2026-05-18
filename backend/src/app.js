const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scan');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/report');

const app = express();
const frontendPath = path.join(__dirname, '..', '..', 'frontend');

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Compression
app.use(compression());

// CORS configuration
const allowedOrigins = (process.env.CLIENT_URL || 'http://127.0.0.1:5500').split(',');
const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
    return true;
  }

  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.vercel.app');
  } catch (_) {
    return false;
  }
};

app.use(cors({
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Website assets
app.use(express.static(frontendPath));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
  });
}

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
  const acceptsHtml = typeof req.headers.accept === 'string' && req.headers.accept.includes('text/html');

  if (acceptsHtml) {
    return res.redirect('/');
  }

  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/report', reportRoutes);

// API index endpoint
app.get('/api', (req, res) => {
  const acceptsHtml = typeof req.headers.accept === 'string' && req.headers.accept.includes('text/html');

  if (acceptsHtml) {
    return res.redirect('/');
  }

  res.json({
    name: 'Digital Footprint Tracker API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      scan: '/api/scan',
      dashboard: '/api/dashboard',
      report: '/api/report',
      health: '/health'
    }
  });
});

// Website page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/:page(login|signup|dashboard|scan|report)', (req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', `${req.params.page}.html`));
});

// 404 handler
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    return res.status(404).sendFile(path.join(frontendPath, 'index.html'));
  }

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

module.exports = app;
