// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const imageRoutes = require('./routes/imageRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const db = require('./config/database');

// Create app
const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// 🔥 FIX: Increase Upload Limit
// ===============================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic root route
app.get('/', (req, res) => {
  res.json({
    message: 'Real Estate Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      schedules: '/api/schedules'
    }
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/favorites', favoritesRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    stack: err.stack
  });
});

// Start server after DB connection
db.getConnection()
  .then(() => {
    console.log('✅ Database connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('📊 Database: real_estate_db');
      console.log('🔐 Environment: development');
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check database configuration and ensure MySQL is running');
    process.exit(1);
  });
