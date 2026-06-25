import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  X,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { fetchEvents, deleteEvent } from "../api/events";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../contexts/toast-context";

const statusColors = {
  draft: "bg-amber-100 text-amber-700 border-amber-200",
  published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
};

const statusBadge = (status) => {
  const color = statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Draft"}
    </span>
  );
};

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Fetch events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const { events: data } = await fetchEvents({ search: searchTerm || undefined });
      setEvents(data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(err.userMessage || "Failed to load events. Please refresh.");
      addToast("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [searchTerm]);

  // Delete event
  const handleDelete = async () => {
    try {
      await deleteEvent(deleteId);
      setEvents(events.filter((e) => e._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      addToast("Event deleted successfully", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      addToast(err.userMessage || "Failed to delete event", "error");
    }
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          <h1 className="text-2xl font-bold">Loading your events...</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ---- Error State ----
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-rose-700">{error}</h3>
            <Button onClick={() => loadEvents()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage all your events</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={() => navigate("/events/create")}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* ---- Events Grid ---- */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">
              {searchTerm ? "No results match your search" : "No events yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Create your first event and start selling tickets!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className="h-full"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden">
                {/* Image */}
                {event.imageUrl ? (
                  <div className="h-44 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-gray-400">
                    <Calendar className="w-16 h-16" />
                  </div>
                )}

                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1 flex-1">
                      {event.title}
                    </h3>
                    {statusBadge(event.status)}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">
                    {event.description || "No description provided"}
                  </p>

                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {event.city}, {event.venue}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} –{" "}
                        {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span>${event.ticketPrice || 0}</span>
                      <span className="text-muted-foreground font-normal ml-1">
                        ({event.capacity} seats)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/events/${event._id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/events/${event._id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setDeleteId(event._id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* ---- Delete Confirmation Modal ---- */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Delete Event</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Are you sure you want to delete this event? This action cannot be undone.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}