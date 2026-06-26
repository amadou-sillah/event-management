const express = require('express');
const router = express.Router();
const attendeeController = require('../controllers/attendeeController');
const auth = require('../middleware/auth');

// All routes require authentication – all roles can manage attendees
router.use(auth);

router.get('/', attendeeController.getAllAttendees);
router.get('/events/:eventId/attendees', attendeeController.getEventAttendees);
router.post('/events/:eventId/attendees', attendeeController.registerAttendee);
router.patch('/:id/checkin', attendeeController.checkInAttendee);
router.delete('/:id', attendeeController.deleteAttendee);

module.exports = router;
