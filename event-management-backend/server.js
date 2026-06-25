require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');
const logger = require('./src/utils/logger');

const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const attendeeRoutes = require('./src/routes/attendeeRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const activityRoutes = require('./src/routes/activityRoutes');

const authService = require('./src/services/authService');

const app = express();
const server = http.createServer(app);

// ============================================================
// 🔵 REQUEST LOGGER – Keep this for debugging
// ============================================================
app.use((req, res, next) => {
  console.log(`🔵 REQUEST: ${req.method} ${req.url}`);
  next();
});

/**
 * =========================
 * GLOBAL UNHANDLED REJECTION / EXCEPTION HANDLERS
 * =========================
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

/**
 * =========================
 * SOCKET.IO SETUP
 * =========================
 */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
app.set('io', io);

/**
 * =========================
 * START SERVER FUNCTION
 * =========================
 */
const startServer = async () => {
  await connectDB();

  /**
   * =========================
   * GLOBAL MIDDLEWARE
   * =========================
   */

  // ============================================================
  // ✅ CRITICAL: Handle OPTIONS preflight BEFORE anything else
  // ============================================================
  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
  
  // --- First, explicitly handle OPTIONS requests ---
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours cache
    res.sendStatus(200);
  });

  // --- Then apply CORS middleware for all other requests ---
  app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Requested-With']
  }));
  console.log(`✅ CORS allowed origin: ${allowedOrigin}`);

  // Security (after CORS to avoid conflicts)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // =============================================
  // 🧪 TEST ROUTE – to verify server is working
  // =============================================
  app.post('/test', (req, res) => {
    console.log('🔵 Test route hit');
    res.json({ message: 'OK' });
  });

  // Logging
  app.use(morgan('dev'));

  // Rate limiter (comment out if suspect)
  // app.use(rateLimiter);

  /**
   * =========================
   * REQUEST DEBUG MIDDLEWARE
   * =========================
   */
  app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.originalUrl}`);
    next();
  });

  /**
   * =========================
   * ROUTES
   * =========================
   */
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/attendees', attendeeRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/activity', activityRoutes);

  /**
   * =========================
   * HEALTH CHECK
   * =========================
   */
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date(),
      uptime: process.uptime()
    });
  });

  /**
   * =========================
   * ERROR HANDLER (MUST BE LAST)
   * =========================
   */
  app.use(errorHandler);

  /**
   * =========================
   * ADMIN SEEDING
   * =========================
   */
  await authService.ensureAdminUser();

  /**
   * =========================
   * SERVER START LOGIC WITH PORT RETRY
   * =========================
   */
  const initialPort = parseInt(process.env.PORT, 10) || 5000;
  let currentPort = initialPort;
  let portAttempts = 0;
  const maxPortAttempts = 5;

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      portAttempts += 1;
      if (portAttempts >= maxPortAttempts) {
        logger.error(`❌ Port ${currentPort} is already in use. Max retries reached.`);
        process.exit(1);
      }
      const nextPort = currentPort + 1;
      logger.warn(`⚠️ Port ${currentPort} busy. Trying ${nextPort}...`);
      currentPort = nextPort;
      server.listen(currentPort);
      return;
    }
    logger.error('❌ Server error:', error);
    process.exit(1);
  });

  server.listen(currentPort, () => {
    logger.info(`🚀 Server running on port ${currentPort}`);
    logger.info(`🔗 API Base: http://localhost:${currentPort}/api`);
  });
};

/**
 * =========================
 * SOCKET EVENTS LOADER
 * =========================
 */
require('./src/sockets/eventSocket')(io);

/**
 * =========================
 * START APP
 * =========================
 */
startServer();