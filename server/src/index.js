require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const competitorRoutes = require('./routes/competitor.routes');
const priceRoutes = require('./routes/price.routes');
const alertRoutes = require('./routes/alert.routes');
const trackingRoutes = require('./routes/tracking.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const categoryRoutes = require('./routes/category.routes');
const adminRoutes = require('./routes/admin.routes');

// Scheduler
const { startScheduler } = require('./services/scheduler.service');

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ---------- Error handler ----------
app.use((err, _req, res, _next) => {
  logger.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ---------- Start ----------
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  connectRedis();
  startScheduler();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();

module.exports = app;
