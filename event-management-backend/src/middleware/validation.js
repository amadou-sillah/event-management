const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

module.exports = (validations) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    console.log('🔵 [VALIDATION] START');

    try {
      // Run each validator with a 5-second timeout
      const runValidations = validations.map((validation, index) => {
        console.log(`🔵 [VALIDATION] Running validator #${index + 1}`);
        return Promise.race([
          validation.run(req),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Validator #${index + 1} timed out`)), 5000)
          )
        ]);
      });

      await Promise.all(runValidations);
      console.log(`🔵 [VALIDATION] All validators completed in ${Date.now() - startTime}ms`);

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        console.log('🔵 [VALIDATION] No errors, proceeding');
        return next();
      }

      const formattedErrors = errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }));

      console.log('🔵 [VALIDATION] Validation failed:', formattedErrors);
      return ApiResponse.error(
        res,
        'Validation failed',
        { code: 'VALIDATION_ERROR', details: formattedErrors },
        400
      );
    } catch (error) {
      console.error('🔴 [VALIDATION] Error:', error.message);
      // If timeout or any other error, send a 500 response
      return ApiResponse.error(
        res,
        'Validation error',
        { code: 'VALIDATION_FAILED', details: error.message },
        500
      );
    }
  };
};