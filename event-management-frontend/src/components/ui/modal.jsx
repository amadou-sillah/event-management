import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={cn("bg-card rounded-lg shadow-lg w-full max-w-md p-6 relative", className)}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X size={18} /></button>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}