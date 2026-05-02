"use client";

/**
 * GARBO — AnnouncementPanel Organism
 * SDD §4.1.4 — Announcement Management Panel
 * Matches Image 5: stacked announcement cards with type label and body text.
 * Handles toggle active/inactive and delete actions inline.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge }   from "@/components/atoms/Badge";
import { cn }      from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/date";
import type { AnnouncementRow, AnnouncementType } from "@/types/database.types";

const TYPE_COLORS: Record<string, string> = {
  "Weather Delay": "warning",
  "Reminder":      "info",
  "Notice":        "default",
  "Cancellation":  "danger",
  "Other":         "default",
};

interface AnnouncementPanelProps {
  announcements: AnnouncementRow[];
  isLoading?:    boolean;
}

export function AnnouncementPanel({ announcements, isLoading = false }: AnnouncementPanelProps) {
  const router              = useRouter();
  const [, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleToggle(ann: AnnouncementRow) {
    setTogglingId(ann.id);
    await fetch(`/api/announcements/${ann.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ is_active: !ann.is_active }),
    });
    setTogglingId(null);
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this announcement?")) return;
    setDeletingId(id);
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    setDeletingId(null);
    startTransition(() => router.refresh());
  }

  if (isLoading) return <AnnouncementSkeleton />;

  if (announcements.length === 0) {
    return (
      <div className="empty-state py-16">
        <span className="empty-state__icon">📢</span>
        <p className="empty-state__title">No announcements yet</p>
        <p className="empty-state__desc">Create an announcement to notify residents of delays, schedule changes, or reminders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((ann) => {
        const badgeVariant = (TYPE_COLORS[ann.type] ?? "default") as "warning" | "info" | "default" | "danger";
        const isToggling   = togglingId === ann.id;
        const isDeleting   = deletingId === ann.id;

        return (
          <div
            key={ann.id}
            className={cn(
              "group flex items-start gap-4 p-4 rounded-lg",
              "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
              "transition-all duration-150 hover:shadow-[var(--shadow-card)]",
              !ann.is_active && "opacity-60",
              (isToggling || isDeleting) && "pointer-events-none opacity-50"
            )}
          >
            {/* Icon */}
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: ann.is_active
                  ? "var(--color-primary)"
                  : "var(--color-bg-table-stripe)",
              }}
            >
              <Megaphone
                size={16}
                style={{ color: ann.is_active ? "white" : "var(--color-text-muted)" }}
                aria-hidden="true"
              />
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={badgeVariant}>{ann.type}</Badge>
                  {!ann.is_active && (
                    <span className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wide">
                      Inactive
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                  {formatRelative(ann.created_at)}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mt-1.5 mb-1">
                {ann.title}
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                {ann.body}
              </p>
            </div>

            {/* Actions — show on hover */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {/* Toggle active */}
              <button
                onClick={() => handleToggle(ann)}
                disabled={isToggling}
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
                  ann.is_active
                    ? "text-[var(--color-success)] hover:bg-[var(--color-success-bg)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-table-stripe)]"
                )}
                aria-label={ann.is_active ? "Deactivate announcement" : "Activate announcement"}
                title={ann.is_active ? "Deactivate" : "Activate"}
              >
                {ann.is_active
                  ? <ToggleRight size={16} />
                  : <ToggleLeft  size={16} />
                }
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(ann.id)}
                disabled={isDeleting}
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                  "text-[var(--color-text-muted)] hover:text-[var(--color-danger)]",
                  "hover:bg-[var(--color-danger-bg)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]"
                )}
                aria-label="Delete announcement"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnnouncementSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="w-9 h-9 rounded-full bg-[var(--color-border)] shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-20 rounded-full bg-[var(--color-border)]" />
            <div className="h-4 w-48 rounded bg-[var(--color-border)]" />
            <div className="h-3.5 w-full rounded bg-[var(--color-border)]" />
            <div className="h-3.5 w-3/4 rounded bg-[var(--color-border)]" />
          </div>
        </div>
      ))}
    </div>
  );
}