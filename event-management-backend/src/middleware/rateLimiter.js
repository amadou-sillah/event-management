const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;