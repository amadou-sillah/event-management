import { useState } from "react";
import { StepIndicator } from "./step-indicator";
import { DetailsStep } from "./steps/details-step";
import { DateTimeStep } from "./steps/datetime-step";
import { TicketingStep } from "./steps/ticketing-step";
import { PreviewStep } from "./steps/preview-step";
import { Button } from "../ui/button";

const steps = ["Event Details", "Date & Location", "Ticketing", "Preview"];

export function EventWizard({ initialData = {}, onSubmit, isEditing = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "Conference", imageUrl: "",
    startDate: "", endDate: "", venue: "", city: "", capacity: 100, ticketPrice: 0,
    status: "draft",  // <-- added status
    ...initialData
  });
  const [errors, setErrors] = useState({});

  const updateData = (data) => setFormData(prev => ({ ...prev, ...data }));

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!formData.title.trim()) newErrors.title = "Title required";
      if (!formData.description.trim()) newErrors.description = "Description required";
    }
    if (currentStep === 1) {
      if (!formData.startDate) newErrors.startDate = "Start date required";
      if (!formData.endDate) newErrors.endDate = "End date required";
      if (!formData.venue.trim()) newErrors.venue = "Venue required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => { if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, steps.length - 1)); };
  const prev = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const handleSubmit = () => { if (validateStep()) onSubmit(formData); };

  const stepProps = { data: formData, updateData, errors };
  const renderStep = () => {
    switch (currentStep) {
      case 0: return <DetailsStep {...stepProps} />;
      case 1: return <DateTimeStep {...stepProps} />;
      case 2: return <TicketingStep {...stepProps} />;
      case 3: return <PreviewStep data={formData} />;
      default: return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border p-6 md:p-8">
      <StepIndicator steps={steps} currentStep={currentStep} />
      <div className="my-8">{renderStep()}</div>
      <div className="flex justify-between">
        {currentStep > 0 && <Button variant="outline" onClick={prev}>Back</Button>}
        {currentStep < steps.length - 1 && <Button onClick={next}>Continue</Button>}
        {currentStep === steps.length - 1 && <Button onClick={handleSubmit}>{isEditing ? "Update Event" : "Publish Event"}</Button>}
      </div>
    </div>
  );
}
