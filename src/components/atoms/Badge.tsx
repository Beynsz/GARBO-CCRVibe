"use client";

/**
 * GARBO — Badge Atom
 * SDD §3.2.1 FR-1.6 — Badges serve as atomic status markers
 * to notify admins of system events or warnings.
 */

import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

interface BadgeProps {
  variant?:  BadgeVariant;
  children:  React.ReactNode;
  className?: string;
  dot?:      boolean;   // Show a leading dot indicator
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--status-pending-bg)] text-[var(--status-pending-text)] border border-[var(--status-pending)]",
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-on-primary)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-text-on-primary)]",
  success:
    "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success)]",
  warning:
    "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning)]",
  danger:
    "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger)]",
  info:
    "bg-[var(--color-info-bg)] text-[var(--color-info-text)] border border-[var(--color-info)]",
  outline:
    "bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)]",
};

const dotColors: Record<BadgeVariant, string> = {
  default:   "bg-[var(--status-pending)]",
  primary:   "bg-white",
  secondary: "bg-white",
  success:   "bg-[var(--color-success)]",
  warning:   "bg-[var(--color-warning)]",
  danger:    "bg-[var(--color-danger)]",
  info:      "bg-[var(--color-info)]",
  outline:   "bg-[var(--color-text-muted)]",
};

export function Badge({
  variant  = "default",
  children,
  className,
  dot      = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5",
        "text-xs font-semibold leading-5 rounded-full whitespace-nowrap",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification count badge (for sidebar nav alerts)
// ─────────────────────────────────────────────────────────────────────────────
interface CountBadgeProps {
  count:     number;
  max?:      number;   // Default 99 — shows "99+" above this
  className?:string;
}

export function CountBadge({ count, max = 99, className }: CountBadgeProps) {
  if (count <= 0) return null;

  const label = count > max ? `${max}+` : String(count);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "min-w-[18px] h-[18px] px-1",
        "text-[10px] font-bold leading-none",
        "bg-[var(--color-danger)] text-white rounded-full",
        className
      )}
      aria-label={`${count} notifications`}
    >
      {label}
    </span>
  );
}