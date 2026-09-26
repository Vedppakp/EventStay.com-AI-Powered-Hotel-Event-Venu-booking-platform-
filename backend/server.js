require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'EventStay API is live and healthy', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EventStay Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
});
