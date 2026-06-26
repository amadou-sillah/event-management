import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CalendarDays,
  Users,
  Ticket,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import apiClient from "../api/axios";

// ---- Animation Variants ----
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

// ---- Reusable Stat Card (Skeleton) ----
const StatCardSkeleton = () => (
  <Card className="border-0 shadow-lg h-full animate-pulse">
    <CardContent className="p-6">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </CardContent>
  </Card>
);

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</h3>
              <div className="flex items-center gap-1 mt-2">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-purple-500/20`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ---- Event Card (Grid Item) ----
const EventCard = ({ event, index }) => {
  const statusIcon = {
    Published: <CheckCircle className="w-3 h-3" />,
    Draft: <Clock className="w-3 h-3" />,
    Cancelled: <XCircle className="w-3 h-3" />,
  }[event.status] || <Clock className="w-3 h-3" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-base truncate pr-2">{event.name}</h4>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mt-1 -mr-2">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Calendar className="w-4 h-4" />
            <span>{event.date}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${event.statusColor}`}
            >
              {statusIcon}
              {event.status}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ---- MAIN DASHBOARD ----
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    monthlyData: [],
    pieData: [],
    recentEvents: [],
    userName: "Organizer",
  });

  // ---- Fetch real data from backend ----
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/dashboard");
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please refresh.");
        // Fallback to empty/zero data
        setDashboardData({
          stats: [
            { title: "Total Events", value: "0", change: "+0%", trend: "up", icon: CalendarDays, color: "from-blue-500 to-cyan-400" },
            { title: "Total Attendees", value: "0", change: "+0%", trend: "up", icon: Users, color: "from-purple-500 to-pink-400" },
            { title: "Tickets Sold", value: "0", change: "0%", trend: "up", icon: Ticket, color: "from-orange-500 to-yellow-400" },
            { title: "Revenue", value: "$0", change: "+0%", trend: "up", icon: DollarSign, color: "from-green-500 to-emerald-400" },
          ],
          monthlyData: [],
          pieData: [],
          recentEvents: [],
          userName: "Organizer",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <h1 className="text-3xl font-bold">Loading your dashboard...</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[300px] bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-[300px] bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ---- Error State ----
  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-rose-700">{error}</h3>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats, monthlyData, pieData, recentEvents, userName } = dashboardData;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* ---- Page Header ---- */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your events today.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-purple-500/30">
          <CalendarDays className="w-4 h-4 mr-2" />
          Create New Event
        </Button>
      </motion.div>

      {/* ---- Stats Grid ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* ---- Charts Row ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <div>
                <CardTitle>Revenue & Attendance</CardTitle>
                <p className="text-sm text-muted-foreground">Last 6 months</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4 h-[200px] sm:h-[260px]">
              {monthlyData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="attendeesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="attendees"
                      stroke="#06B6D4"
                      strokeWidth={3}
                      fill="url(#attendeesGradient)"
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
            <CardHeader>
              <CardTitle>Ticket Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">Paid vs Free</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[180px] sm:h-[200px]">
              {pieData.length === 0 ? (
                <div className="text-muted-foreground">No data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255,255,255,0.9)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-6 mt-2">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-muted-foreground">
                          {entry.name} ({entry.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ---- RECENT EVENTS - GRID OF CARDS (no table) ---- */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your upcoming and past events</p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events created yet. Start by creating your first event!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentEvents.map((event, index) => (
                  <EventCard key={event.id || index} event={event} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
