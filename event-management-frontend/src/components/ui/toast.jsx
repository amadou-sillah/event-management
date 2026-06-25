import { cn } from "../../lib/utils";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function Toast({ message, type = "info", onClose }) {
  const Icon = icons[type] || Info;
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border bg-card p-4 shadow-md", {
      "border-green-500": type === "success",
      "border-red-500": type === "error",
      "border-blue-500": type === "info",
      "border-yellow-500": type === "warning",
    })}>
      <Icon className="h-5 w-5" />
      <span className="flex-1 text-sm">{message}</span>
      <button onClick={onClose}><X size={16} /></button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}