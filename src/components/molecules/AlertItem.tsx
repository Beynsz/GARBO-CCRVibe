"use client";

/**
 * GARBO — AlertItem Molecule
 * SDD §3.2.2 FR-2.5 — Alert Indicator (Badge + Icon).
 * Matches Image 6: coloured rows with icon + label + colour-coded left border.
 */

import { cn } from "@/lib/utils/cn";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertItemProps {
  type:       AlertType;
  title:      string;
  message?:   string;
  timestamp?: string;
  onDismiss?: () => void;
  className?: string;
}

const ALERT_CONFIG: Record<
  AlertType,
  { icon: React.ElementType; bg: string; border: string; iconColor: string; textColor: string }
> = {
  success: {
    icon:      CheckCircle2,
    bg:        "var(--color-success-bg)",
    border:    "var(--color-success)",
    iconColor: "var(--color-success)",
    textColor: "var(--color-success-text)",
  },
  error: {
    icon:      XCircle,
    bg:        "var(--color-danger-bg)",
    border:    "var(--color-danger)",
    iconColor: "var(--color-danger)",
    textColor: "var(--color-danger-text)",
  },
  warning: {
    icon:      AlertCircle,
    bg:        "var(--color-warning-bg)",
    border:    "var(--color-warning)",
    iconColor: "var(--color-warning)",
    textColor: "var(--color-warning-text)",
  },
  info: {
    icon:      Info,
    bg:        "var(--color-info-bg)",
    border:    "var(--color-info)",
    iconColor: "var(--color-info)",
    textColor: "var(--color-info-text)",
  },
};

export function AlertItem({
  type,
  title,
  message,
  timestamp,
  onDismiss,
  className,
}: AlertItemProps) {
  const config = ALERT_CONFIG[type];
  const AlertIcon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3.5 rounded-lg border-l-4",
        "transition-all duration-150",
        className
      )}
      style={{
        background:  config.bg,
        borderColor: config.border,
      }}
      role="alert"
    >
      {/* Icon */}
      <AlertIcon
        size={20}
        className="shrink-0 mt-0.5"
        style={{ color: config.iconColor }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: config.textColor }}
        >
          {title}
        </p>
        {message && (
          <p className="text-xs mt-0.5 text-[var(--color-text-muted)] leading-relaxed">
            {message}
          </p>
        )}
        {timestamp && (
          <p className="text-[10px] mt-1 text-[var(--color-text-muted)] opacity-75">
            {timestamp}
          </p>
        )}
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            "shrink-0 p-0.5 rounded transition-opacity duration-150",
            "opacity-50 hover:opacity-100",
            "focus-visible:outline-none focus-visible:ring-1",
            "focus-visible:ring-[var(--color-border-focus)]"
          )}
          aria-label="Dismiss alert"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}