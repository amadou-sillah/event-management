// ============================================================
// ROLE CHECK MIDDLEWARE
// ============================================================

/**
 * Check if user has one of the required roles
 * @param {...string} allowedRoles - List of roles allowed
 * @returns {Function} Express middleware
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found'
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${allowedRoles.join(', ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

module.exports = roleCheck;
