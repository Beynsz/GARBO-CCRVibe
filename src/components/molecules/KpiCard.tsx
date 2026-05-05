"use client";

/**
 * GARBO — KpiCard Molecule
 * SDD §3.2.2 — KPI Cards surface key performance indicators.
 * SDD §4.1.2 — Data Dashboard Grid component.
 * Matches Image 3: coloured cards with label, value, and sub-text.
 */

import { cn } from "@/lib/utils/cn";
import type { IconName } from "@/components/atoms/Icon";
import { Icon } from "@/components/atoms/Icon";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type KpiVariant = "default" | "success" | "warning" | "danger" | "info" | "primary";

interface KpiCardProps {
  label:       string;
  value:       string | number;
  subText?:    string;
  icon?:       IconName;
  variant?:    KpiVariant;
  isLoading?:  boolean;
  className?:  string;
  onClick?:    () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant styles — matches earth-toned design + SRS high-contrast status colours
// ─────────────────────────────────────────────────────────────────────────────
const VARIANT_STYLES: Record<
  KpiVariant,
  { card: string; icon: string; value: string }
> = {
  default: {
    card:  "bg-[var(--color-bg-surface)] border-[var(--color-border)]",
    icon:  "bg-[var(--color-bg-table-stripe)] text-[var(--color-primary)]",
    value: "text-[var(--color-text-primary)]",
  },
  primary: {
    card:  "bg-[var(--color-primary)] border-[var(--color-primary-dark)]",
    icon:  "bg-[rgba(253,250,244,0.15)] text-white",
    value: "text-white",
  },
  success: {
    card:  "bg-[var(--color-success-bg)] border-[var(--color-success)]",
    icon:  "bg-[rgba(76,175,80,0.15)] text-[var(--color-success-dark)]",
    value: "text-[var(--color-success-dark)]",
  },
  warning: {
    card:  "bg-[var(--color-warning-bg)] border-[var(--color-warning)]",
    icon:  "bg-[rgba(255,152,0,0.15)] text-[var(--color-warning-dark)]",
    value: "text-[var(--color-warning-dark)]",
  },
  danger: {
    card:  "bg-[var(--color-danger-bg)] border-[var(--color-danger)]",
    icon:  "bg-[rgba(244,67,54,0.15)] text-[var(--color-danger-dark)]",
    value: "text-[var(--color-danger-dark)]",
  },
  info: {
    card:  "bg-[var(--color-info-bg)] border-[var(--color-info)]",
    icon:  "bg-[rgba(33,150,243,0.15)] text-[var(--color-info-dark,#0D47A1)]",
    value: "text-[var(--color-info-dark,#0D47A1)]",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function KpiCard({
  label,
  value,
  subText,
  icon,
  variant   = "default",
  isLoading = false,
  className,
  onClick,
}: KpiCardProps) {
  const styles  = VARIANT_STYLES[variant];
  const isLight = variant === "primary";

  return (
    <div
      className={cn(
        "kpi-card border",
        styles.card,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "kpi-card__label",
            isLight && "text-[rgba(253,250,244,0.75)]"
          )}
        >
          {label}
        </span>

        {icon && (
          <span
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
              styles.icon
            )}
          >
            <Icon name={icon} size={18} />
          </span>
        )}
      </div>

      {/* Value */}
      {isLoading ? (
        <div className="h-8 w-20 rounded bg-[rgba(0,0,0,0.08)] animate-pulse mt-1" />
      ) : (
        <p
          className={cn("kpi-card__value mt-1", styles.value)}
          aria-live="polite"
        >
          {value}
        </p>
      )}

      {/* Sub-text */}
      {subText && (
        <p
          className={cn(
            "kpi-card__sub",
            isLight && "text-[rgba(253,250,244,0.65)]"
          )}
        >
          {subText}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton version — for Suspense fallbacks
// ─────────────────────────────────────────────────────────────────────────────
export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "kpi-card border border-[var(--color-border)] bg-[var(--color-bg-surface)]",
        "animate-pulse",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="h-3 w-24 rounded bg-[var(--color-border)]" />
        <div className="w-9 h-9 rounded-lg bg-[var(--color-border)]" />
      </div>
      <div className="h-8 w-16 rounded bg-[var(--color-border)] mt-2" />
      <div className="h-3 w-32 rounded bg-[var(--color-border)] mt-1" />
    </div>
  );
}