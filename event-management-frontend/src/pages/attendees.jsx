import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserCheck,
  UserX,
  Trash2,
  UserPlus,
  X,
  AlertCircle,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import { fetchAttendees, registerAttendee, checkInAttendee, deleteAttendee } from "../api/attendees";
import { useToast } from "../contexts/toast-context";
import { useNavigate } from "react-router-dom";

// ---- Animation Variants ----
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
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

export default function Attendees() {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [newAttendee, setNewAttendee] = useState({ name: "", email: "", eventId: "" });
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ---- Load attendees ----
  const loadAttendees = async () => {
    try {
      setLoading(true);
      const result = await fetchAttendees({
        page,
        limit: 9,
        search: searchTerm || undefined,
      });
      setAttendees(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error("Failed to load attendees:", err);
      setError(err.userMessage || "Failed to load attendees");
      addToast("Failed to load attendees", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendees();
  }, [page, searchTerm]);

  // ---- Handle check-in toggle ----
  const handleCheckIn = async (id) => {
    try {
      const updated = await checkInAttendee(id);
      // Optimistically update the list
      setAttendees(prev =>
        prev.map(a => (a._id === id ? { ...a, checkedIn: updated.checkedIn } : a))
      );
      addToast(`Attendee ${updated.checkedIn ? 'checked in' : 'unchecked'}`, "success");
    } catch (err) {
      addToast(err.userMessage || "Check-in failed", "error");
      loadAttendees(); // revert
    }
  };

  // ---- Handle delete ----
  const handleDelete = async () => {
    try {
      await deleteAttendee(deleteId);
      setAttendees(prev => prev.filter(a => a._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      addToast("Attendee deleted successfully", "success");
    } catch (err) {
      addToast(err.userMessage || "Delete failed", "error");
    }
  };

  // ---- Handle create attendee ----
  const handleCreate = async () => {
    if (!newAttendee.name || !newAttendee.email || !newAttendee.eventId) {
      addToast("All fields are required", "warning");
      return;
    }
    setSubmitting(true);
    try {
      await registerAttendee(newAttendee.eventId, {
        name: newAttendee.name,
        email: newAttendee.email,
      });
      addToast("Attendee registered successfully", "success");
      setShowCreateModal(false);
      setNewAttendee({ name: "", email: "", eventId: "" });
      loadAttendees();
    } catch (err) {
      addToast(err.userMessage || "Registration failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          <h1 className="text-2xl font-bold">Loading attendees...</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
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
            <Button onClick={() => loadAttendees()} className="mt-4">
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
          <h1 className="text-3xl font-bold">Attendees</h1>
          <p className="text-muted-foreground">Manage attendees across all your events</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Register
          </Button>
        </div>
      </div>

      {/* ---- Attendees Grid ---- */}
      {attendees.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">
              {searchTerm ? "No results match your search" : "No attendees yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Register attendees to your events and they'll appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {attendees.map((attendee, index) => (
            <motion.div
              key={attendee._id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden">
                <CardContent className="p-5 flex-1 flex flex-col">
                  {/* Header: Name + Check-in Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{attendee.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{attendee.email}</span>
                      </div>
                    </div>
                    <Badge
                      variant={attendee.checkedIn ? "success" : "secondary"}
                      className={`ml-2 flex-shrink-0 ${
                        attendee.checkedIn
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}
                    >
                      {attendee.checkedIn ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {attendee.checkedIn ? "Checked In" : "Pending"}
                    </Badge>
                  </div>

                  {/* Event info */}
                  <div className="mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {attendee.eventId?.title || "Event"}
                      </span>
                    </div>
                    {attendee.eventId?.startDate && (
                      <div className="text-xs mt-0.5 text-muted-foreground/70">
                        {new Date(attendee.eventId.startDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                    <Button
                      variant={attendee.checkedIn ? "outline" : "default"}
                      size="sm"
                      className={`flex-1 ${
                        !attendee.checkedIn &&
                        "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                      }`}
                      onClick={() => handleCheckIn(attendee._id)}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      {attendee.checkedIn ? "Undo" : "Check In"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setDeleteId(attendee._id);
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
        </motion.div>
      )}

      {/* ---- Pagination ---- */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* ---- Create Attendee Modal ---- */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New Attendee"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input
              placeholder="e.g., John Doe"
              value={newAttendee.name}
              onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={newAttendee.email}
              onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Event ID</label>
            <Input
              placeholder="Paste the event ID here"
              value={newAttendee.eventId}
              onChange={(e) => setNewAttendee({ ...newAttendee, eventId: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find the event ID in the URL when viewing an event.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {submitting ? "Registering..." : "Register"}
            </Button>
          </div>
        </div>
      </Modal>

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
                  <h3 className="text-xl font-semibold">Delete Attendee</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This action cannot be undone. The attendee will be removed from the event.
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