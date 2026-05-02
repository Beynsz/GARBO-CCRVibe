"use client";

/**
 * GARBO — RecentActivityFeed Organism
 * Shows the last N events (operations, incidents, announcements) on the dashboard.
 * SDD §4.1.2 — Data Dashboard Grid.
 */

import { cn } from "@/lib/utils/cn";
import { StatusPill } from "@/components/atoms/StatusPill";
import type { RecentActivity } from "@/types/app.types";
import { formatRelative } from "@/lib/utils/date";
import {
  CheckCircle2,
  AlertTriangle,
  Megaphone,
} from "lucide-react";

interface RecentActivityFeedProps {
  activities: RecentActivity[];
  isLoading?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity type config
// ─────────────────────────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: RecentActivity["type"] }) {
  switch (type) {
    case "operation":
      return (
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--color-success-bg)" }}
        >
          <CheckCircle2 size={15} style={{ color: "var(--color-success)" }} />
        </span>
      );
    case "incident":
      return (
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--color-danger-bg)" }}
        >
          <AlertTriangle size={15} style={{ color: "var(--color-danger)" }} />
        </span>
      );
    case "announcement":
      return (
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--color-info-bg)" }}
        >
          <Megaphone size={15} style={{ color: "var(--color-info)" }} />
        </span>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Single activity row
// ─────────────────────────────────────────────────────────────────────────────
function ActivityRow({ activity }: { activity: RecentActivity }) {
  return (
    <li className="flex items-start gap-3 py-3 border-b border-[var(--color-border)] last:border-b-0">
      <ActivityIcon type={activity.type} />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-primary)] leading-snug line-clamp-2">
          {activity.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {formatRelative(activity.timestamp)}
          </span>
          {activity.status && (
            <StatusPill status={activity.status} size="sm" showDot={false} />
          )}
        </div>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feed
// ─────────────────────────────────────────────────────────────────────────────
export function RecentActivityFeed({
  activities,
  isLoading = false,
  className,
}: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <ul className={cn("space-y-0", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="flex items-start gap-3 py-3 border-b border-[var(--color-border)] last:border-b-0 animate-pulse"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-border)] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-full rounded bg-[var(--color-border)]" />
              <div className="h-3 w-2/3 rounded bg-[var(--color-border)]" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <p className="text-sm text-[var(--color-text-muted)]">No recent activity</p>
      </div>
    );
  }

  return (
    <ul className={cn("space-y-0", className)} role="list" aria-label="Recent activity">
      {activities.map((activity) => (
        <ActivityRow key={`${activity.type}-${activity.id}`} activity={activity} />
      ))}
    </ul>
  );
}