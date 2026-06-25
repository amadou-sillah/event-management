export function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex justify-between mb-8">
      {steps.map((step, idx) => (
        <div key={idx} className="flex-1 text-center">
          <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            idx <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>{idx + 1}</div>
          <span className="text-xs mt-1 hidden sm:inline">{step}</span>
        </div>
      ))}
    </div>
  );
}