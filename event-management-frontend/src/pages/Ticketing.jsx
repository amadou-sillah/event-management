import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Ticket,
  DollarSign,
  Users,
  Calendar,
  X,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import { fetchTickets, createTicket, updateTicket, deleteTicket, purchaseTicket } from "../api/tickets";
import { fetchEvents } from "../api/events";
import { useToast } from "../contexts/toast-context";

// Animation variants
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

export default function Ticketing() {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({
    eventId: "",
    type: "",
    price: "",
    quantityAvailable: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { addToast } = useToast();

  // ---- Load data ----
  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, eventsData] = await Promise.all([
        fetchTickets(),
        fetchEvents({ limit: 999 }),
      ]);
      setTickets(ticketsData);
      setEvents(eventsData.events || []);
      setError(null);
    } catch (err) {
      console.error("Load data error:", err);
      setError(err.userMessage || "Failed to load data");
      addToast("Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---- Filter tickets ----
  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      ticket.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.eventId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEvent = filterEvent ? ticket.eventId?._id === filterEvent : true;
    return matchSearch && matchEvent;
  });

  // ---- Open create/ edit modal ----
  const openCreateModal = () => {
    setEditingTicket(null);
    setFormData({ eventId: "", type: "", price: "", quantityAvailable: "" });
    setShowCreateModal(true);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      eventId: ticket.eventId._id,
      type: ticket.type,
      price: ticket.price,
      quantityAvailable: ticket.quantityAvailable,
    });
    setShowCreateModal(true);
  };

  // ---- Submit create/ update ----
  const handleSubmit = async () => {
    const { eventId, type, price, quantityAvailable } = formData;
    if (!eventId || !type || price === "" || quantityAvailable === "") {
      addToast("All fields are required", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTicket) {
        await updateTicket(editingTicket._id, {
          type,
          price: parseFloat(price),
          quantityAvailable: parseInt(quantityAvailable),
        });
        addToast("Ticket updated", "success");
      } else {
        await createTicket(eventId, {
          type,
          price: parseFloat(price),
          quantityAvailable: parseInt(quantityAvailable),
        });
        addToast("Ticket created", "success");
      }
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      addToast(err.userMessage || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    try {
      await deleteTicket(deleteId);
      setTickets(tickets.filter((t) => t._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      addToast("Ticket deleted", "success");
    } catch (err) {
      addToast(err.userMessage || "Delete failed", "error");
    }
  };

  // ---- Purchase ticket ----
  const handlePurchase = async (ticketId, quantity = 1) => {
    try {
      const result = await purchaseTicket(ticketId, quantity);
      addToast(`✅ Purchased ${quantity} ticket(s)!`, "success");
      await loadData(); // Refresh tickets
    } catch (err) {
      addToast(err.userMessage || "Purchase failed", "error");
    }
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          <h1 className="text-2xl font-bold">Loading tickets...</h1>
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
            <Button onClick={() => loadData()} className="mt-4">
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
          <h1 className="text-3xl font-bold">Ticketing</h1>
          <p className="text-muted-foreground">Manage ticket types for your events</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            className="px-3 py-2 border rounded-md bg-background text-sm"
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ticket
          </Button>
        </div>
      </div>

      {/* ---- Tickets Grid ---- */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">
              {searchTerm || filterEvent ? "No results match your filters" : "No tickets yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterEvent
                ? "Try adjusting your search or filter."
                : "Create ticket types for your events to start selling."}
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
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket._id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden">
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{ticket.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ticket.eventId?.title || "Event"}
                      </p>
                    </div>
                    <Badge
                      variant={ticket.quantityAvailable > 0 ? "success" : "destructive"}
                      className={`${ticket.quantityAvailable > 0 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}
                    >
                      {ticket.quantityAvailable > 0 ? "Available" : "Sold Out"}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">${ticket.price}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {ticket.quantitySold} sold / {ticket.quantityAvailable} available
                      </span>
                    </div>
                    {ticket.eventId?.startDate && (
                      <div className="flex items-center gap-1.5 text-muted-foreground/70 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(ticket.eventId.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditModal(ticket)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setDeleteId(ticket._id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>

                  {/* ---- BUY BUTTON ---- */}
                  {ticket.quantityAvailable > 0 && (
                    <div className="mt-3">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                        onClick={() => handlePurchase(ticket._id, 1)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy 1 Ticket (${ticket.price})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ---- Create/Edit Modal ---- */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingTicket ? "Edit Ticket" : "Create Ticket"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Event</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              disabled={!!editingTicket}
            >
              <option value="">Select an event</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Ticket Type</label>
            <Input
              placeholder="e.g., VIP, Regular, Early Bird"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Price ($)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Quantity Available</label>
            <Input
              type="number"
              step="1"
              placeholder="100"
              value={formData.quantityAvailable}
              onChange={(e) => setFormData({ ...formData, quantityAvailable: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {submitting ? "Saving..." : editingTicket ? "Update" : "Create"}
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
                  <h3 className="text-xl font-semibold">Delete Ticket</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This action cannot be undone. The ticket type will be permanently removed.
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
