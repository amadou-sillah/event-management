const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Public (within auth) – everyone can view events
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Protected – only admin and organizer can create/update/delete
router.post('/', roleCheck('admin', 'organizer'), eventController.createEvent);
router.put('/:id', roleCheck('admin', 'organizer'), eventController.updateEvent);
router.delete('/:id', roleCheck('admin', 'organizer'), eventController.deleteEvent);

module.exports = router;
