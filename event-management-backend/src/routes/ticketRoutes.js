const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Everyone can view tickets
router.get('/', ticketController.getAllTickets);
router.get('/events/:eventId/tickets', ticketController.getEventTickets);

// Only admin and organizer can manage tickets
router.post('/events/:eventId/tickets', roleCheck('admin', 'organizer'), ticketController.addTicketType);
router.put('/:id', roleCheck('admin', 'organizer'), ticketController.updateTicket);
router.delete('/:id', roleCheck('admin', 'organizer'), ticketController.deleteTicket);

// Public purchase (no auth required)
router.post('/purchase', ticketController.purchaseTicket);

module.exports = router;
