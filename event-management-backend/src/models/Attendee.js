const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  ticketType: { type: String, default: 'Regular' },
  checkedIn: { type: Boolean, default: false },
  registrationDate: { type: Date, default: Date.now }
});

attendeeSchema.index({ eventId: 1, email: 1 }, { unique: true });
attendeeSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('Attendee', attendeeSchema);