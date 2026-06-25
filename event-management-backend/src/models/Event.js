const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    category: { type: String, default: 'Conference' },
    imageUrl: { type: String, default: '' },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    venue: { type: String, required: true },
    city: { type: String, required: true },

    capacity: { type: Number, required: true, min: 1 },
    ticketPrice: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['draft', 'published', 'completed'],
      default: 'draft'
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    ticketsSold: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Indexes (kept clean and useful)
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ organizerId: 1 });
eventSchema.index({ title: 'text' });

module.exports = mongoose.model('Event', eventSchema);