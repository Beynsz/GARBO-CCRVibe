"use client";

/**
 * GARBO — ToastContainer
 * Renders in-app toast notifications for realtime events (new incidents, etc).
 * Positioned fixed bottom-right, stacks up to 5 toasts.
 * Driven by the toasts array from useRealtimeAlerts.
 */

import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Toast } from "@/types/app.types";

const TOAST_CONFIG = {
  success: {
    icon:   CheckCircle2,
    bg:     "var(--color-success-bg)",
    border: "var(--color-success)",
    text:   "var(--color-success-text)",
    title:  "var(--color-success-dark)",
  },
  error: {
    icon:   AlertCircle,
    bg:     "var(--color-danger-bg)",
    border: "var(--color-danger)",
    text:   "var(--color-danger-text)",
    title:  "var(--color-danger-dark)",
  },
  warning: {
    icon:   AlertTriangle,
    bg:     "var(--color-warning-bg)",
    border: "var(--color-warning)",
    text:   "var(--color-warning-text)",
    title:  "var(--color-warning-dark)",
  },
  info: {
    icon:   Info,
    bg:     "var(--color-info-bg)",
    border: "var(--color-info)",
    text:   "var(--color-info-text)",
    title:  "var(--color-info-dark,#0D47A1)",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Single toast item
// ─────────────────────────────────────────────────────────────────────────────
function ToastItem({
  toast,
  onDismiss,
}: {
  toast:     Toast;
  onDismiss: (id: string) => void;
}) {
  const cfg     = TOAST_CONFIG[toast.type];
  const ToastIcon = cfg.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 p-4 rounded-xl border-l-4",
        "shadow-[var(--shadow-modal)] animate-fade-in",
        "bg-[var(--color-bg-surface)]"
      )}
      style={{ borderLeftColor: cfg.border }}
      role="alert"
      aria-live="assertive"
    >
      <ToastIcon
        size={18}
        className="shrink-0 mt-0.5"
        style={{ color: cfg.border }}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: cfg.title }}
        >
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: cfg.text }}>
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className={cn(
          "shrink-0 w-6 h-6 rounded-md flex items-center justify-center",
          "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-bg-table-stripe)] transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
        )}
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Container — fixed bottom-right stack
// ─────────────────────────────────────────────────────────────────────────────
interface ToastContainerProps {
  toasts:    Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[var(--z-toast)]",
        "flex flex-col gap-2 pointer-events-none"
      )}
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}