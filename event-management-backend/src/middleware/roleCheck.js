const ApiResponse = require('../utils/apiResponse');

const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(res, 'Forbidden: insufficient privileges', 
        { code: 'FORBIDDEN' }, 403);
    }
    next();
  };
};

module.exports = roleCheck;