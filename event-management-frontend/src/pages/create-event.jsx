import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEvent, updateEvent, fetchEventById } from "../api/events";
import { EventWizard } from "../components/wizard/event-wizard";
import { useToast } from "../contexts/toast-context";
import { Skeleton } from "../components/ui/skeleton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function CreateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      fetchEventById(id)
        .then((data) => {
          setInitialData(data);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to load event:", err);
          setError(err.userMessage || "Failed to load event");
          addToast("Failed to load event", "error");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, addToast]);

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateEvent(id, data);
        addToast("Event updated successfully", "success");
      } else {
        await createEvent(data);
        addToast("Event created successfully", "success");
      }
      navigate("/events");
    } catch (err) {
      console.error("Submit error:", err);
      addToast(
        err.userMessage || (isEditing ? "Update failed" : "Creation failed"),
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/events")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update your event details"
              : "Fill in the details to create a new event"}
          </p>
        </div>
      </div>

      <EventWizard
        initialData={initialData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </div>
  );
}