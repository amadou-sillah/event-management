const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
  const startTime = Date.now();
  logger.info('🔐 AUTH: Start');

  try {
    const authHeader = req.headers.authorization;
    logger.info(`🔐 AUTH: Header = ${authHeader ? 'present' : 'missing'}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('Access denied. Token missing or malformed');
      err.statusCode = 401;
      err.code = 'NO_TOKEN';
      logger.warn('🔐 AUTH: No token');
      return next(err);
    }

    const token = authHeader.split(' ')[1];
    logger.info('🔐 AUTH: Token extracted');

    if (!process.env.JWT_SECRET) {
      const err = new Error('JWT_SECRET not defined');
      err.statusCode = 500;
      logger.error('🔐 AUTH: JWT_SECRET missing');
      return next(err);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info(`🔐 AUTH: Token verified, decoded = ${JSON.stringify(decoded)}`);
    } catch (error) {
      const err = new Error('Invalid or expired token');
      err.statusCode = 401;
      err.code = 'INVALID_TOKEN';
      logger.warn('🔐 AUTH: Token invalid');
      return next(err);
    }

    // ✅ Accept multiple possible field names for user ID
    const userId = decoded.userId || decoded.id || decoded.sub || decoded._id;
    if (!userId) {
      const err = new Error('Token does not contain a user identifier');
      err.statusCode = 401;
      err.code = 'INVALID_TOKEN_PAYLOAD';
      logger.warn('🔐 AUTH: No user ID in token payload');
      return next(err);
    }

    // Query with timeout
    const user = await User.findById(userId)
      .select('-password')
      .maxTimeMS(5000)
      .lean();

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 401;
      err.code = 'USER_NOT_FOUND';
      logger.warn(`🔐 AUTH: User ${userId} not found`);
      return next(err);
    }

    req.user = user;
    logger.info(`🔐 AUTH: User authenticated: ${user.email} (${user.role})`);
    logger.info(`🔐 AUTH: Completed in ${Date.now() - startTime}ms`);
    next();
  } catch (error) {
    logger.error(`🔐 AUTH: Error - ${error.message}`);
    error.statusCode = 500;
    error.code = 'AUTH_ERROR';
    next(error);
  }
};