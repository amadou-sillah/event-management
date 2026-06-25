const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// ---- Root route (for the main dashboard) ----
router.get('/', dashboardController.getDashboardData);

// ---- Other endpoints (if you need them) ----
router.get('/summary', dashboardController.getSummary);
router.get('/revenue', dashboardController.getRevenue);
router.get('/activity', dashboardController.getActivity);

module.exports = router;