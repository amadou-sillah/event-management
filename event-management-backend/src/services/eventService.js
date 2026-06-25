const mongoose = require('mongoose');
const Event = require('../models/Event');

exports.createEvent = async (eventData, userId) => {
  console.log('🔵 [SERVICE] createEvent called with userId:', userId);
  console.log('🔵 [SERVICE] eventData:', eventData);

  const event = new Event({
    ...eventData,
    organizerId: userId
  });

  console.log('🔵 [SERVICE] About to save event...');
  await event.save();
  console.log('🔵 [SERVICE] Event saved successfully. ID:', event._id);
  return event;
};

exports.getAllEvents = async ({
  page = 1,
  limit = 10,
  search,
  status,
  userId,
  role
}) => {
  console.log('🔵 [SERVICE] getAllEvents called');
  const query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (status) {
    query.status = status;
  }

  if (role !== 'admin') {
    query.organizerId = userId;
  }

  console.log('🔵 [SERVICE] Query:', JSON.stringify(query));

  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    Event.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate('organizerId', 'name email'),

    Event.countDocuments(query)
  ]);

  console.log(`🔵 [SERVICE] Found ${events.length} events (total ${total})`);
  return { events, total };
};

exports.getEventById = async (id) => {
  console.log(`🔵 [SERVICE] getEventById for ID: ${id}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid event ID');
  }

  const event = await Event.findById(id).populate('organizerId', 'name email');

  if (!event) {
    throw new Error('Event not found');
  }

  console.log(`🔵 [SERVICE] Event found: ${event._id}`);
  return event;
};

/**
 * UPDATE EVENT – with detailed authorization logging
 */
exports.updateEvent = async (id, updateData, userId, role) => {
  console.log(`🔵 [SERVICE] updateEvent for ID: ${id} by user ${userId} (role: ${role})`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid event ID');
  }

  const event = await Event.findById(id).select('organizerId');
  if (!event) {
    throw new Error('Event not found');
  }

  // Log both IDs for comparison
  const organizerId = event.organizerId.toString();
  const userStringId = userId.toString();
  console.log(`🔵 [SERVICE] Event organizerId: ${organizerId}`);
  console.log(`🔵 [SERVICE] User ID: ${userStringId}`);
  console.log(`🔵 [SERVICE] Role: ${role}`);
  console.log(`🔵 [SERVICE] Are they equal? ${organizerId === userStringId}`);

  // Authorization check
  const isAuthorized = role === 'admin' || organizerId === userStringId;
  console.log(`🔵 [SERVICE] isAuthorized: ${isAuthorized}`);

  if (!isAuthorized) {
    console.error('🔴 [SERVICE] Authorization failed – user does not own this event and is not admin');
    throw new Error('Not authorized');
  }

  console.log('🔵 [SERVICE] Updating event with data:', updateData);
  const updated = await Event.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  console.log(`🔵 [SERVICE] Event updated: ${updated._id}`);
  return updated;
};

/**
 * DELETE EVENT – with detailed authorization logging
 */
exports.deleteEvent = async (id, userId, role) => {
  console.log(`🔵 [SERVICE] deleteEvent for ID: ${id} by user ${userId} (role: ${role})`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid event ID');
  }

  const event = await Event.findById(id).select('organizerId');
  if (!event) {
    throw new Error('Event not found');
  }

  const organizerId = event.organizerId.toString();
  const userStringId = userId.toString();
  console.log(`🔵 [SERVICE] Event organizerId: ${organizerId}`);
  console.log(`🔵 [SERVICE] User ID: ${userStringId}`);
  console.log(`🔵 [SERVICE] Are they equal? ${organizerId === userStringId}`);

  const isAuthorized = role === 'admin' || organizerId === userStringId;
  console.log(`🔵 [SERVICE] isAuthorized: ${isAuthorized}`);

  if (!isAuthorized) {
    console.error('🔴 [SERVICE] Authorization failed – user does not own this event and is not admin');
    throw new Error('Not authorized');
  }

  await Event.findByIdAndDelete(id);
  console.log(`🔵 [SERVICE] Event deleted: ${id}`);
  return true;
};