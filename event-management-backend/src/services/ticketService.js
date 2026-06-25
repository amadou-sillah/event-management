const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

/**
 * Add a new ticket type to an event
 */
exports.addTicketType = async (ticketData) => {
  console.log('🔵 [TICKET SERVICE] addTicketType called with:', ticketData);

  // Extract eventId from ticketData
  const { eventId, type, price, quantityAvailable } = ticketData;

  // Validate event exists
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error('Invalid event ID');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  // Create ticket
  const ticket = new Ticket({
    eventId,
    type,
    price,
    quantityAvailable,
    quantitySold: 0
  });

  await ticket.save();
  console.log('🔵 [TICKET SERVICE] Ticket created:', ticket._id);
  return ticket;
};

/**
 * Get all tickets for an event
 */
exports.getTicketsByEvent = async (eventId) => {
  console.log('🔵 [TICKET SERVICE] getTicketsByEvent for:', eventId);

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error('Invalid event ID');
  }

  const tickets = await Ticket.find({ eventId });
  console.log(`🔵 [TICKET SERVICE] Found ${tickets.length} tickets`);
  return tickets;
};

/**
 * Purchase a ticket (reduce quantityAvailable, increase quantitySold)
 */
exports.purchaseTicket = async (ticketId, quantity) => {
  console.log(`🔵 [TICKET SERVICE] purchaseTicket for ${ticketId}, qty: ${quantity}`);

  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new Error('Invalid ticket ID');
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }

  if (ticket.quantityAvailable < quantity) {
    throw new Error('Not enough tickets available');
  }

  ticket.quantityAvailable -= quantity;
  ticket.quantitySold += quantity;
  await ticket.save();

  console.log('🔵 [TICKET SERVICE] Purchase successful');
  return ticket;
};