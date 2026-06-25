const Event = require('../models/Event');

// ============================================================
// GET /api/events – Get all events for the current user
// ============================================================
exports.getEvents = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { search, status, page = 1, limit = 10 } = req.query;
    const query = { organizerId: userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);

    res.json({
      events,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// ============================================================
// GET /api/events/:id – Get a single event
// ============================================================
exports.getEventById = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      organizerId: userId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
};

// ============================================================
// POST /api/events – Create a new event
// ============================================================
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user ID found' });
    }

    const eventData = {
      ...req.body,
      organizerId: userId
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

// ============================================================
// PUT /api/events/:id – Update an event
// ============================================================
exports.updateEvent = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      organizerId: userId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const allowedUpdates = [
      'title', 'description', 'category', 'imageUrl',
      'startDate', 'endDate', 'venue', 'city',
      'capacity', 'ticketPrice', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
};

// ============================================================
// DELETE /api/events/:id – Delete an event
// ============================================================
exports.deleteEvent = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      organizerId: userId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
};