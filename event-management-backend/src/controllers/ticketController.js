const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Helper: get event IDs for the current organizer
const getOrganizerEventIds = async (userId) => {
  const events = await Event.find({ organizerId: userId }).select('_id');
  return events.map(e => e._id);
};

// ============================================================
// GET /api/tickets – Get all tickets for the organizer's events
// ============================================================
exports.getAllTickets = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const eventIds = await getOrganizerEventIds(userId);
    if (eventIds.length === 0) {
      return ApiResponse.success(res, 'No tickets found', []);
    }

    const tickets = await Ticket.find({ eventId: { $in: eventIds } })
      .populate('eventId', 'title startDate')
      .sort({ createdAt: -1 });

    ApiResponse.success(res, 'Tickets fetched', tickets);
  } catch (error) {
    logger.error('getAllTickets error:', error);
    next(error);
  }
};

// ============================================================
// POST /api/events/:eventId/tickets – Add a ticket type
// ============================================================
exports.addTicketType = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const { eventId } = req.params;
    // Verify event belongs to organizer
    const event = await Event.findOne({ _id: eventId, organizerId: userId });
    if (!event) {
      return next({ statusCode: 404, message: 'Event not found or not yours' });
    }

    // Map incoming fields (support both 'name' and 'type')
    const { name, type, quantity, quantityAvailable, price } = req.body;
    const ticketData = {
      eventId,
      type: type || name,
      price,
      quantityAvailable: quantityAvailable || quantity,
    };

    if (!ticketData.type || ticketData.price === undefined || ticketData.quantityAvailable === undefined) {
      return next({ statusCode: 400, message: 'Missing required fields: type, price, quantityAvailable' });
    }

    const ticket = new Ticket(ticketData);
    await ticket.save();

    logger.info(`Ticket created: ${ticket._id} for event ${eventId}`);
    ApiResponse.success(res, 'Ticket type added', ticket, 201);
  } catch (error) {
    logger.error('addTicketType error:', error);
    next(error);
  }
};

// ============================================================
// GET /api/events/:eventId/tickets – Get tickets for a specific event
// ============================================================
exports.getEventTickets = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const { eventId } = req.params;
    const event = await Event.findOne({ _id: eventId, organizerId: userId });
    if (!event) {
      return next({ statusCode: 404, message: 'Event not found or not yours' });
    }

    const tickets = await Ticket.find({ eventId });
    ApiResponse.success(res, 'Tickets fetched', tickets);
  } catch (error) {
    logger.error('getEventTickets error:', error);
    next(error);
  }
};

// ============================================================
// PUT /api/tickets/:id – Update a ticket type
// ============================================================
exports.updateTicket = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const ticket = await Ticket.findById(req.params.id).populate('eventId');
    if (!ticket) {
      return next({ statusCode: 404, message: 'Ticket not found' });
    }

    // Verify ownership via event
    const event = await Event.findOne({ _id: ticket.eventId._id, organizerId: userId });
    if (!event) {
      return next({ statusCode: 403, message: 'You do not have permission to update this ticket' });
    }

    const allowedUpdates = ['type', 'price', 'quantityAvailable'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        ticket[field] = req.body[field];
      }
    });

    await ticket.save();
    ApiResponse.success(res, 'Ticket updated', ticket);
  } catch (error) {
    logger.error('updateTicket error:', error);
    next(error);
  }
};

// ============================================================
// DELETE /api/tickets/:id – Delete a ticket type
// ============================================================
exports.deleteTicket = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const ticket = await Ticket.findById(req.params.id).populate('eventId');
    if (!ticket) {
      return next({ statusCode: 404, message: 'Ticket not found' });
    }

    const event = await Event.findOne({ _id: ticket.eventId._id, organizerId: userId });
    if (!event) {
      return next({ statusCode: 403, message: 'You do not have permission to delete this ticket' });
    }

    await ticket.deleteOne();
    ApiResponse.success(res, 'Ticket deleted successfully');
  } catch (error) {
    logger.error('deleteTicket error:', error);
    next(error);
  }
};

// ============================================================
// POST /api/purchase – Purchase a ticket (for public checkout)
// ============================================================
exports.purchaseTicket = async (req, res, next) => {
  try {
    const { ticketId, quantity } = req.body;
    if (!ticketId || !quantity) {
      return next({ statusCode: 400, message: 'Missing ticketId or quantity' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return next({ statusCode: 404, message: 'Ticket not found' });
    }

    if (ticket.quantityAvailable < quantity) {
      return next({ statusCode: 400, message: 'Not enough tickets available' });
    }

    ticket.quantityAvailable -= quantity;
    ticket.quantitySold += quantity;
    await ticket.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('ticketPurchased', { ticketId, quantity });
    }

    ApiResponse.success(res, 'Purchase successful', { ticket });
  } catch (error) {
    logger.error('purchaseTicket error:', error);
    next(error);
  }
};