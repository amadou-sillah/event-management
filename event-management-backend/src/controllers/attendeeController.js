const Attendee = require('../models/Attendee');
const Event = require('../models/Event');
const activityService = require('../services/activityService');
const ApiResponse = require('../utils/apiResponse');

// Helper: get event IDs for the current organizer
const getOrganizerEventIds = async (userId) => {
  const events = await Event.find({ organizerId: userId }).select('_id');
  return events.map(e => e._id);
};

// ============================================================
// GET /api/attendees – Get all attendees for the organizer's events
// ============================================================
exports.getAllAttendees = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const { page = 1, limit = 10, search } = req.query;
    const eventIds = await getOrganizerEventIds(userId);
    if (eventIds.length === 0) {
      return ApiResponse.paginated(res, [], parseInt(page), parseInt(limit), 0);
    }

    const query = { eventId: { $in: eventIds } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [attendees, total] = await Promise.all([
      Attendee.find(query)
        .populate('eventId', 'title startDate')
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendee.countDocuments(query)
    ]);

    ApiResponse.paginated(res, attendees, parseInt(page), parseInt(limit), total);
  } catch (error) {
    console.error('GetAllAttendees error:', error);
    next(error);
  }
};

// ============================================================
// GET /api/events/:eventId/attendees – Get attendees for a specific event
// ============================================================
exports.getEventAttendees = async (req, res, next) => {
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

    const { page = 1, limit = 10, search } = req.query;
    const query = { eventId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [attendees, total] = await Promise.all([
      Attendee.find(query)
        .populate('eventId', 'title startDate')
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendee.countDocuments(query)
    ]);

    ApiResponse.paginated(res, attendees, parseInt(page), parseInt(limit), total);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/events/:eventId/attendees – Register a new attendee
// ============================================================
exports.registerAttendee = async (req, res, next) => {
  try {
    console.log('🔵 [ATTENDEE] registerAttendee called');
    console.log('🔵 [ATTENDEE] req.params:', req.params);
    console.log('🔵 [ATTENDEE] req.body:', req.body);

    const userId = req.user._id || req.user.id;
    console.log('🔵 [ATTENDEE] userId:', userId);

    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const { eventId } = req.params;
    console.log('🔵 [ATTENDEE] Looking for event:', eventId);

    const event = await Event.findOne({ _id: eventId, organizerId: userId });
    console.log('🔵 [ATTENDEE] Event found:', event);

    if (!event) {
      return next({ statusCode: 404, message: 'Event not found or not yours' });
    }

    // Check if attendee already exists
    const existing = await Attendee.findOne({ eventId, email: req.body.email.toLowerCase() });
    if (existing) {
      return next({ statusCode: 409, message: 'Attendee already registered for this event' });
    }

    const attendeeData = {
      ...req.body,
      eventId,
      email: req.body.email.toLowerCase()
    };

    const attendee = new Attendee(attendeeData);
    await attendee.save();

    req.app.get('io').emit('attendeeRegistered', { eventId, attendee });
    await activityService.logActivity(userId, 'attendee_registered', attendee._id, { eventId, email: attendee.email });

    ApiResponse.success(res, 'Attendee registered', attendee, 201);
  } catch (error) {
    console.error('🔴 [ATTENDEE] Register error:', error);
    next(error);
  }
};

// ============================================================
// PATCH /api/attendees/:id/checkin – Check in an attendee
// ============================================================
exports.checkInAttendee = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const attendee = await Attendee.findById(req.params.id).populate('eventId');
    if (!attendee) {
      return next({ statusCode: 404, message: 'Attendee not found' });
    }

    const event = await Event.findOne({ _id: attendee.eventId._id, organizerId: userId });
    if (!event) {
      return next({ statusCode: 403, message: 'You do not have permission to check in this attendee' });
    }

    attendee.checkedIn = !attendee.checkedIn;
    await attendee.save();

    req.app.get('io').emit('attendeeCheckedIn', { attendeeId: req.params.id, checkedIn: attendee.checkedIn });
    await activityService.logActivity(userId, 'attendee_checkin_toggle', req.params.id, { checkedIn: attendee.checkedIn });

    ApiResponse.success(res, `Attendee ${attendee.checkedIn ? 'checked in' : 'unchecked'}`, attendee);
  } catch (error) {
    console.error('CheckInAttendee error:', error);
    next(error);
  }
};

// ============================================================
// DELETE /api/attendees/:id – Delete an attendee
// ============================================================
exports.deleteAttendee = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const attendee = await Attendee.findById(req.params.id).populate('eventId');
    if (!attendee) {
      return next({ statusCode: 404, message: 'Attendee not found' });
    }

    const event = await Event.findOne({ _id: attendee.eventId._id, organizerId: userId });
    if (!event) {
      return next({ statusCode: 403, message: 'You do not have permission to delete this attendee' });
    }

    await attendee.deleteOne();
    await activityService.logActivity(userId, 'attendee_deleted', req.params.id);

    ApiResponse.success(res, 'Attendee deleted successfully');
  } catch (error) {
    console.error('DeleteAttendee error:', error);
    next(error);
  }
};
