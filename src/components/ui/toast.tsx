"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom event dispatcher for lightweight, dependency-free toast notifications
export function showToast(message: string, description?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("reelforge:toast", { detail: { message, description } })
    );
  }
}

interface ToastItem {
  id: number;
  message: string;
  description?: string;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message: detail.message, description: detail.description }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    window.addEventListener("reelforge:toast", handleToast);
    return () => window.removeEventListener("reelforge:toast", handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-start justify-between gap-3 rounded-xl border border-violet-500/40",
            "bg-card/95 p-4 shadow-2xl shadow-violet-950/40 backdrop-blur-xl",
            "animate-in fade-in slide-in-from-bottom-5 duration-200"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">{toast.message}</p>
              {toast.description && (
                <p className="text-xs text-muted-foreground">{toast.description}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            aria-label="Close notification"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
