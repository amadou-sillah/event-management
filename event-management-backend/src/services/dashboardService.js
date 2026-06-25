const Event = require('../models/Event');
const Attendee = require('../models/Attendee');

exports.getSummary = async (userId, role) => {
  const eventQuery = role === 'admin' ? {} : { organizerId: userId };
  const totalEvents = await Event.countDocuments(eventQuery);
  const upcomingEvents = await Event.countDocuments({ ...eventQuery, startDate: { $gt: new Date() } });
  const attendeeQuery = role === 'admin' ? {} : { eventId: { $in: await Event.find(eventQuery).distinct('_id') } };
  const totalAttendees = await Attendee.countDocuments(attendeeQuery);
  const events = await Event.find(eventQuery);
  const revenue = events.reduce((sum, e) => sum + (e.ticketPrice * (e.ticketsSold || 0)), 0);
  return { totalEvents, upcomingEvents, totalAttendees, revenue };
};

exports.getRevenueData = async (userId, role) => {
  const eventQuery = role === 'admin' ? {} : { organizerId: userId };
  const events = await Event.find(eventQuery);
  // Group by month (simplified)
  const monthly = {};
  events.forEach(event => {
    const month = event.startDate.toISOString().slice(0, 7);
    const rev = event.ticketPrice * (event.ticketsSold || 0);
    monthly[month] = (monthly[month] || 0) + rev;
  });
  return Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }));
};