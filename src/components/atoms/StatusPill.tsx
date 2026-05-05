"use client";

/**
 * GARBO — StatusPill Atom
 * SRS §3.2.1.1 — High-contrast status colors (Green/Red) for readability.
 * Maps OperationStatus → coloured pill with dot indicator.
 */

import { cn } from "@/lib/utils/cn";
import type { OperationStatus } from "@/types/app.types";

interface StatusPillProps {
  status:     OperationStatus;
  size?:      "sm" | "md";
  showDot?:   boolean;
  className?: string;
}

// Config table — keeps colour logic in one place
const STATUS_CONFIG: Record<
  OperationStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Completed: {
    label:  "Completed",
    bg:     "var(--status-completed-bg)",
    text:   "var(--status-completed-text)",
    border: "var(--status-completed)",
    dot:    "var(--status-completed)",
  },
  Delayed: {
    label:  "Delayed",
    bg:     "var(--status-delayed-bg)",
    text:   "var(--status-delayed-text)",
    border: "var(--status-delayed)",
    dot:    "var(--status-delayed)",
  },
  Missed: {
    label:  "Missed",
    bg:     "var(--status-missed-bg)",
    text:   "var(--status-missed-text)",
    border: "var(--status-missed)",
    dot:    "var(--status-missed)",
  },
  Pending: {
    label:  "Pending",
    bg:     "var(--status-pending-bg)",
    text:   "var(--status-pending-text)",
    border: "var(--status-pending)",
    dot:    "var(--status-pending)",
  },
};

export function StatusPill({
  status,
  size    = "md",
  showDot = true,
  className,
}: StatusPillProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full whitespace-nowrap",
        "border",
        size === "sm" ? "text-[10px] px-2   py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
      style={{
        background:   config.bg,
        color:        config.text,
        borderColor:  config.border,
      }}
    >
      {showDot && (
        <span
          className={cn("rounded-full shrink-0", size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5")}
          style={{ background: config.dot }}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline select for updating status directly in a table row
// ─────────────────────────────────────────────────────────────────────────────
const ALL_STATUSES: OperationStatus[] = ["Pending", "Completed", "Delayed", "Missed"];

interface StatusSelectProps {
  value:      OperationStatus;
  onChange:   (status: OperationStatus) => void;
  disabled?:  boolean;
  className?: string;
}

export function StatusSelect({
  value,
  onChange,
  disabled,
  className,
}: StatusSelectProps) {
  const config = STATUS_CONFIG[value];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as OperationStatus)}
      disabled={disabled}
      className={cn(
        "text-xs font-semibold rounded-full border px-2.5 py-1",
        "cursor-pointer appearance-none",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-1",
        "transition-colors duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "pr-6",  // extra padding for dropdown arrow
        className
      )}
      style={{
        background:  config.bg,
        color:       config.text,
        borderColor: config.border,
      }}
      aria-label={`Status: ${value}`}
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}