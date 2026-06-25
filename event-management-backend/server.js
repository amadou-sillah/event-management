require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
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

const PORT = process.env.PORT || 5000;

/* =========================
   ALLOWED ORIGINS
========================= */
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

/* =========================
   SOCKET.IO
========================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

app.set('io', io);

/* =========================
   GLOBAL ERROR HANDLERS
========================= */
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

/* =========================
   START SERVER
========================= */
const startServer = async () => {
  /* DB CONNECTION */
  try {
    await connectDB();
    logger.info('✅ MongoDB connected successfully');
  } catch (err) {
    logger.error('❌ MongoDB connection failed:', err.message);
  }

  /* SECURITY */
  app.use(helmet());

  /* BODY PARSER */
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  /* LOGGING */
  app.use(morgan('dev'));

  /* =========================
     CORS (FIXED - NO ERRORS)
  ========================= */
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // DO NOT THROW ERROR (important fix)
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);

  /* =========================
     ROOT ROUTE
  ========================= */
  app.get('/', (req, res) => {
    res.json({
      message: 'Event Management API is running 🚀',
      status: 'OK',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        events: '/api/events'
      }
    });
  });

  /* =========================
     HEALTH CHECK
  ========================= */
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date()
    });
  });

  /* =========================
     ROUTES
  ========================= */
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/attendees', attendeeRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/activity', activityRoutes);

  /* =========================
     ERROR HANDLER
  ========================= */
  app.use(errorHandler);

  /* =========================
     ADMIN SEED
  ========================= */
  try {
    await authService.ensureAdminUser();
  } catch (err) {
    logger.error('Admin seeding failed:', err.message);
  }

  /* =========================
     START SERVER
  ========================= */
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🔗 API Base: /api`);
  });
};

/* =========================
   SOCKET EVENTS
========================= */
require('./src/sockets/eventSocket')(io);

/* =========================
   START APP
========================= */
startServer();