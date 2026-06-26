import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchEventById } from "../api/events";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../contexts/toast-context";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Edit,
  ArrowLeft,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";

const statusColors = {
  draft: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
};

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchEventById(id);
        setEvent(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load event:", err);
        setError(err.userMessage || "Failed to load event details");
        addToast("Failed to load event details", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, addToast]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-rose-700">{error}</h3>
            <Button onClick={() => navigate("/events")} className="mt-4">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Event not found</h3>
            <Button onClick={() => navigate("/events")} className="mt-4">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ---- Back Button ---- */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/events")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Button>
        <Link to={`/events/${id}/edit`}>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Event
          </Button>
        </Link>
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[event.status] || "bg-gray-100 text-gray-700"}`}>
            {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || "Draft"}
          </span>
          <span className="text-sm text-muted-foreground">
            Created {new Date(event.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* ---- Image ---- */}
      <div className="rounded-lg overflow-hidden shadow-lg">
        <img
          src={event.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200"}
          alt={event.title}
          className="w-full h-48 sm:h-64 md:h-80 object-cover"
        />
      </div>

      {/* ---- Details Grid ---- */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {event.description || "No description provided."}
            </p>
            {event.category && (
              <div className="flex items-center gap-2 mt-4 text-sm">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category: {event.category}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.startDate).toLocaleString()} – <br />
                  {new Date(event.endDate).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {event.venue}, {event.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-sm text-muted-foreground">
                  {event.capacity} seats • {event.ticketsSold || 0} sold
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Price</p>
                <p className="text-sm text-muted-foreground">
                  ${event.ticketPrice || 0} per ticket
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t">
              <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
