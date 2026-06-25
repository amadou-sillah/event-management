const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');

router.use(auth);

// ---- New: get all tickets for the organizer ----
router.get('/', ticketController.getAllTickets);

// ---- Per-event endpoints ----
router.post('/events/:eventId/tickets', ticketController.addTicketType);
router.get('/events/:eventId/tickets', ticketController.getEventTickets);

// ---- Ticket CRUD ----
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

// ---- Purchase (public) ----
router.post('/purchase', ticketController.purchaseTicket);

module.exports = router;