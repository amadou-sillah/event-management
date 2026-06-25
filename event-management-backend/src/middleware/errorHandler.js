const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(err);

  const statusCode = err.statusCode || 500;

  return ApiResponse.error(
    res,
    err.message || 'Internal Server Error',
    {
      code: err.code || 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'production' ? null : err.stack
    },
    statusCode
  );
};