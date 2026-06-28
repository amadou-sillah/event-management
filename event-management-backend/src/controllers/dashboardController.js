const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Attendee = require('../models/Attendee');
const User = require('../models/User');

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ============================================================
// MAIN DASHBOARD DATA (GET /api/dashboard)
// ============================================================
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log('🔍 Dashboard userId:', userId);

    // ---- 1. User name ----
    const user = await User.findById(userId);
    const userName = user ? user.name : 'Organizer';

    // ---- 2. Total Events ----
    const totalEvents = await Event.countDocuments({ organizerId: userId });
    console.log('📊 Total events:', totalEvents);

    // ---- 3. Total Attendees (from Attendee collection) ----
    const eventIds = await Event.find({ organizerId: userId }).select('_id');
    const totalAttendees = await Attendee.countDocuments({ eventId: { $in: eventIds } });
    console.log('👥 Total attendees:', totalAttendees);

    // ---- 4. Ticket stats (via lookup) ----
    const ticketStats = await Ticket.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      { $match: { 'event.organizerId': userId } },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$quantitySold' },
          totalRevenue: { $sum: { $multiply: ['$price', '$quantitySold'] } },
          paidTickets: {
            $sum: {
              $cond: [{ $gt: ['$price', 0] }, '$quantitySold', 0]
            }
          },
          freeTickets: {
            $sum: {
              $cond: [{ $eq: ['$price', 0] }, '$quantitySold', 0]
            }
          }
        }
      }
    ]);

    const totalTicketsSold = ticketStats.length > 0 ? ticketStats[0].totalSold : 0;
    const totalRevenue = ticketStats.length > 0 ? ticketStats[0].totalRevenue : 0;
    const paidTickets = ticketStats.length > 0 ? ticketStats[0].paidTickets : 0;
    const freeTickets = ticketStats.length > 0 ? ticketStats[0].freeTickets : 0;

    // ---- 5. Monthly data (last 6 months) ----
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyAgg = await Event.aggregate([
      { $match: { organizerId: userId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'eventId',
          as: 'tickets'
        }
      },
      { $unwind: { path: '$tickets', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: { $multiply: ['$tickets.price', '$tickets.quantitySold'] } },
          attendees: { $sum: '$ticketsSold' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    let monthlyData = monthlyAgg.map(item => ({
      name: monthNames[item._id.month - 1],
      revenue: item.revenue || 0,
      attendees: item.attendees || 0
    }));

    // Fill missing months
    const currentMonth = new Date().getMonth();
    while (monthlyData.length < 6) {
      const missingMonthIndex = (currentMonth - (6 - monthlyData.length) + 12) % 12;
      monthlyData.unshift({
        name: monthNames[missingMonthIndex],
        revenue: 0,
        attendees: 0
      });
    }

    // ---- 6. Pie chart ----
    const totalTicketCount = paidTickets + freeTickets || 1;
    const pieData = [
      { name: 'Paid', value: Math.round((paidTickets / totalTicketCount) * 100), color: '#8B5CF6' },
      { name: 'Free', value: Math.round((freeTickets / totalTicketCount) * 100), color: '#34D399' }
    ];

    // ---- 7. Recent events ----
    const recentEventsRaw = await Event.find({ organizerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title startDate status');

    console.log('📋 Recent events found:', recentEventsRaw.length);

    const statusColorMap = {
      'published': 'text-emerald-500 bg-emerald-50',
      'draft': 'text-amber-500 bg-amber-50',
      'completed': 'text-blue-500 bg-blue-50'
    };

    const recentEvents = recentEventsRaw.map(event => ({
      id: event._id,
      name: event.title,
      date: event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD',
      status: event.status.charAt(0).toUpperCase() + event.status.slice(1),
      statusColor: statusColorMap[event.status] || 'text-gray-500 bg-gray-50'
    }));

    // ---- 8. Stats cards ----
    const stats = [
      {
        title: 'Total Events',
        value: totalEvents.toString(),
        change: '+12.5%',
        trend: 'up',
        icon: 'CalendarDays',
        color: 'from-blue-500 to-cyan-400'
      },
      {
        title: 'Total Attendees',
        value: totalAttendees.toLocaleString(),
        change: '+8.2%',
        trend: 'up',
        icon: 'Users',
        color: 'from-purple-500 to-pink-400'
      },
      {
        title: 'Tickets Sold',
        value: totalTicketsSold.toLocaleString(),
        change: '-2.4%',
        trend: 'down',
        icon: 'Ticket',
        color: 'from-orange-500 to-yellow-400'
      },
      {
        title: 'Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: '+23.1%',
        trend: 'up',
        icon: 'DollarSign',
        color: 'from-green-500 to-emerald-400'
      }
    ];

    res.status(200).json({
      success: true,
      userName,
      stats,
      monthlyData,
      pieData,
      recentEvents
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    });
  }
};

// ============================================================
// EXISTING / STUB ENDPOINTS
// ============================================================

exports.getSummary = async (req, res) => {
  try {
    res.json({ message: 'Summary endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    res.json({ message: 'Revenue endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    res.json({ message: 'Activity endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
