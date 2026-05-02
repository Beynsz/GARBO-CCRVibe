"use client";

/**
 * GARBO — TodayRoutesTable Organism
 * Quick-view table of today's collection routes + their current status.
 * Shown on the Home dashboard below the KPI cards.
 * SDD §4.1.3 — Collection Schedule Table (lightweight variant for dashboard).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatusPill, StatusSelect } from "@/components/atoms/StatusPill";
import { cn } from "@/lib/utils/cn";
import type { TodayRoute } from "@/services/dashboard.service";
import type { OperationStatus } from "@/types/app.types";
import { formatDate, todayISO } from "@/lib/utils/date";

interface TodayRoutesTableProps {
  routes:     TodayRoute[];
  isLoading?: boolean;
}

export function TodayRoutesTable({ routes, isLoading = false }: TodayRoutesTableProps) {
  const router          = useRouter();
  const [, startTransition] = useTransition();
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleStatusChange(operationId: string, newStatus: OperationStatus) {
    setUpdating(operationId);

    try {
      const res = await fetch(`/api/operations/${operationId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Update failed");

      startTransition(() => router.refresh());
    } catch (err) {
      console.error("[TodayRoutesTable] Status update error:", err);
    } finally {
      setUpdating(null);
    }
  }

  if (isLoading) {
    return <TodayRoutesTableSkeleton />;
  }

  if (routes.length === 0) {
    return (
      <div className="empty-state py-10">
        <span className="empty-state__icon">📅</span>
        <p className="empty-state__title">No routes scheduled today</p>
        <p className="empty-state__desc">
          Routes are auto-generated at midnight from the Master Schedule.
        </p>
        <Link
          href="/schedule"
          className="mt-2 text-sm text-[var(--color-primary)] hover:underline font-medium"
        >
          Manage schedules →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="data-table">
        <thead>
          <tr>
            <th>Sitio</th>
            <th>Route</th>
            <th>Collection Day</th>
            <th>Status</th>
            <th className="text-right">Fuel (L)</th>
            <th className="text-right">Waste (kg)</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => {
            const isBeingUpdated = updating === route.operationId;

            return (
              <tr
                key={route.operationId}
                className={cn(isBeingUpdated && "opacity-60 pointer-events-none")}
              >
                {/* Sitio */}
                <td className="font-medium text-[var(--color-text-primary)]">
                  {route.sitioName}
                </td>

                {/* Route name */}
                <td className="text-[var(--color-text-secondary)]">
                  {route.routeName}
                </td>

                {/* Date */}
                <td className="text-[var(--color-text-muted)] text-xs">
                  {formatDate(todayISO())}
                </td>

                {/* Status — inline select */}
                <td>
                  <StatusSelect
                    value={route.status}
                    onChange={(s) => handleStatusChange(route.operationId, s)}
                    disabled={isBeingUpdated}
                  />
                </td>

                {/* Fuel */}
                <td className="text-right text-[var(--color-text-secondary)] text-sm">
                  {route.fuelL != null
                    ? route.fuelL.toFixed(1)
                    : <span className="text-[var(--color-text-muted)]">—</span>
                  }
                </td>

                {/* Waste */}
                <td className="text-right text-[var(--color-text-secondary)] text-sm">
                  {route.wasteKg != null
                    ? route.wasteKg.toFixed(1)
                    : <span className="text-[var(--color-text-muted)]">—</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function TodayRoutesTableSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden animate-pulse">
      {/* Header */}
      <div className="h-10 bg-[var(--color-bg-table-stripe)] border-b border-[var(--color-border)]" />
      {/* Rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="h-3.5 w-28 rounded bg-[var(--color-border)]" />
          <div className="h-3.5 w-36 rounded bg-[var(--color-border)]" />
          <div className="h-3.5 w-20 rounded bg-[var(--color-border)]" />
          <div className="h-6 w-24 rounded-full bg-[var(--color-border)]" />
          <div className="ml-auto h-3.5 w-10 rounded bg-[var(--color-border)]" />
          <div className="h-3.5 w-10 rounded bg-[var(--color-border)]" />
        </div>
      ))}
    </div>
  );
}