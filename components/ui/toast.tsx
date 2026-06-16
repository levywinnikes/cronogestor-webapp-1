"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

const TOAST_EVENT = "app-toast-notification";

export const toast = {
  success: (msg: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: "success", message: msg } }));
    }
  },
  error: (msg: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: "error", message: msg } }));
    }
  },
  info: (msg: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: "info", message: msg } }));
    }
  },
  warning: (msg: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: "warning", message: msg } }));
    }
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: ToastType; message: string }>;
      const { type, message } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prev) => [...prev, { id, type, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    };

    window.addEventListener(TOAST_EVENT, handleToastEvent);
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToastEvent);
    };
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          error: <XCircle className="w-5 h-5 text-rose-500" />,
          info: <Info className="w-5 h-5 text-blue-500" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        };

        const borderColors = {
          success: "border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/90",
          error: "border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/90",
          info: "border-blue-500/20 bg-blue-50/90 dark:bg-blue-950/90",
          warning: "border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/90",
        };

        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-in",
              borderColors[t.type]
            )}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
            <div className="flex-1 text-sm font-semibold text-text-primary leading-snug">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
