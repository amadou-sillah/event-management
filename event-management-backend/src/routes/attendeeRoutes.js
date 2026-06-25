const express = require('express');
const router = express.Router();
const attendeeController = require('../controllers/attendeeController');
const { registerAttendeeValidator } = require('../validators/attendeeValidator');
const validate = require('../middleware/validation');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/events/:eventId/attendees', validate(registerAttendeeValidator), attendeeController.registerAttendee);
router.get('/events/:eventId/attendees', attendeeController.getEventAttendees);
router.get('/', attendeeController.getAllAttendees);
router.patch('/:id/checkin', attendeeController.checkInAttendee);
router.delete('/:id', attendeeController.deleteAttendee);

module.exports = router;