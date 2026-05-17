const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Import your routes
// Note: Adjust paths if your main app logic is structured differently
const authRoutes = require('../backend/src/routes/auth');
const dashboardRoutes = require('../frontend/pages/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Export the app for Vercel
module.exports = app;
