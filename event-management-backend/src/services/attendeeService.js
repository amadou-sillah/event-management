const Attendee = require('../models/Attendee');
const Event = require('../models/Event');

exports.registerAttendee = async (eventId, attendeeData) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  const existing = await Attendee.findOne({ eventId, email: attendeeData.email });
  if (existing) {
    const error = new Error('Attendee already registered for this event');
    error.statusCode = 400;
    throw error;
  }
  const attendee = new Attendee({ ...attendeeData, eventId });
  await attendee.save();
  return attendee;
};

exports.getAttendeesByEvent = async (eventId, { page, limit, search }) => {
  const query = { eventId };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  const skip = (page - 1) * limit;
  const [attendees, total] = await Promise.all([
    Attendee.find(query).skip(skip).limit(limit).populate('eventId', 'title'),
    Attendee.countDocuments(query)
  ]);
  return { attendees, total };
};

exports.getAllAttendees = async ({ page, limit, search }) => {
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  const skip = (page - 1) * limit;
  const [attendees, total] = await Promise.all([
    Attendee.find(query).skip(skip).limit(limit).populate('eventId', 'title'),
    Attendee.countDocuments(query)
  ]);
  return { attendees, total };
};

exports.checkInAttendee = async (attendeeId) => {
  const attendee = await Attendee.findById(attendeeId);
  if (!attendee) {
    const error = new Error('Attendee not found');
    error.statusCode = 404;
    throw error;
  }
  attendee.checkedIn = true;
  await attendee.save();
  return attendee;
};

exports.deleteAttendee = async (attendeeId) => {
  const attendee = await Attendee.findByIdAndDelete(attendeeId);
  if (!attendee) {
    const error = new Error('Attendee not found');
    error.statusCode = 404;
    throw error;
  }
  return attendee;
};