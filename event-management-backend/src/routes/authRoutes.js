const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validation');
const auth = require('../middleware/auth');

// ---- Public routes ----
router.post('/register', validate(registerValidator), authController.register);
router.post('/login', validate(loginValidator), authController.login);

// ---- Protected routes (require authentication) ----
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);   // ✅ Update profile (name, email)
router.put('/password', auth, authController.changePassword); // ✅ Change password

module.exports = router;