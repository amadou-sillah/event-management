const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  type: { type: String, required: true }, // VIP, Regular, Early Bird
  price: { type: Number, required: true },
  quantityAvailable: { type: Number, required: true },
  quantitySold: { type: Number, default: 0 }
});

ticketSchema.index({ eventId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);