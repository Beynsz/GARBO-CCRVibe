"use client";

/**
 * GARBO — OperationsTable Organism
 * SDD §4.1.3 — Collection Schedule Table (operations view).
 * Full table of daily operations with:
 *   - OperationsFilterBar (date range, sitio, status)
 *   - Inline StatusSelect per row
 *   - "Update resources" slide-in panel via ResourceUpdateForm
 *   - Bulk status update (select rows → mark all Missed / Completed)
 *   - Day summary bar at the top
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, RefreshCw } from "lucide-react";
import { StatusPill, StatusSelect } from "@/components/atoms/StatusPill";
import { Button }                   from "@/components/atoms/Button";
import { OperationsFilterBar }      from "@/components/molecules/FilterBar";
import { ResourceUpdateForm }       from "@/components/organisms/ResourceUpdateForm";
import { cn }                       from "@/lib/utils/cn";
import { formatDateShort }          from "@/lib/utils/date";
import type { OperationWithDetails, OperationStatus, OperationsFilterValues } from "@/types/app.types";
import type { SitioRow }            from "@/types/database.types";

// ─────────────────────────────────────────────────────────────────────────────
// Day-summary bar
// ─────────────────────────────────────────────────────────────────────────────
interface DaySummaryBarProps {
  operations: OperationWithDetails[];
}

function DaySummaryBar({ operations }: DaySummaryBarProps) {
  const total     = operations.length;
  const completed = operations.filter((o) => o.status === "Completed").length;
  const delayed   = operations.filter((o) => o.status === "Delayed").length;
  const missed    = operations.filter((o) => o.status === "Missed").length;
  const pending   = operations.filter((o) => o.status === "Pending").length;
  const rate      = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg mb-4 text-sm"
      style={{ background: "var(--color-bg-table-stripe)", border: "1px solid var(--color-border)" }}
    >
      <span className="font-medium text-[var(--color-text-primary)]">
        {total} route{total !== 1 ? "s" : ""}
      </span>
      <span className="text-[var(--color-text-muted)]">·</span>
      {[
        { label: "Completed", count: completed, color: "var(--status-completed-text)" },
        { label: "Delayed",   count: delayed,   color: "var(--status-delayed-text)"   },
        { label: "Missed",    count: missed,    color: "var(--status-missed-text)"    },
        { label: "Pending",   count: pending,   color: "var(--color-text-muted)"      },
      ].map(({ label, count, color }) => count > 0 && (
        <span key={label} style={{ color }} className="font-medium text-xs">
          {count} {label}
        </span>
      ))}
      <span className="ml-auto text-xs font-semibold" style={{
        color: rate >= 80 ? "var(--color-success-text)"
             : rate >= 50 ? "var(--color-warning-text)"
             : "var(--color-danger-text)"
      }}>
        {rate}% completion
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main table
// ─────────────────────────────────────────────────────────────────────────────
interface OperationsTableProps {
  operations: OperationWithDetails[];
  sitios:     SitioRow[];
  isLoading?: boolean;
}

const DEFAULT_FILTERS: OperationsFilterValues = {
  from: "", to: "", sitioId: "", status: "",
};

export function OperationsTable({
  operations,
  sitios,
  isLoading = false,
}: OperationsTableProps) {
  const router              = useRouter();
  const [, startTransition] = useTransition();

  const [filters,      setFilters    ] = useState<OperationsFilterValues>(DEFAULT_FILTERS);
  const [selected,     setSelected   ] = useState<Set<string>>(new Set());
  const [editOp,       setEditOp     ] = useState<OperationWithDetails | null>(null);
  const [bulkLoading,  setBulkLoading] = useState(false);
  const [updatingId,   setUpdatingId ] = useState<string | null>(null);

  // ── Client-side filtering ─────────────────────────────────────────────────
  const visible = operations.filter((op) => {
    if (filters.from    && op.operation_date < filters.from)       return false;
    if (filters.to      && op.operation_date > filters.to)         return false;
    if (filters.sitioId && op.sitio_id !== filters.sitioId)        return false;
    if (filters.status  && op.status   !== filters.status)         return false;
    return true;
  });

  // ── Inline status change ──────────────────────────────────────────────────
  async function handleStatusChange(id: string, newStatus: OperationStatus) {
    setUpdatingId(id);
    await fetch(`/api/operations/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: newStatus }),
    });
    setUpdatingId(null);
    startTransition(() => router.refresh());
  }

  // ── Bulk update ───────────────────────────────────────────────────────────
  async function handleBulkUpdate(status: OperationStatus) {
    if (selected.size === 0) return;
    setBulkLoading(true);

    await fetch("/api/operations/bulk", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ids: Array.from(selected), status }),
    });

    setSelected(new Set());
    setBulkLoading(false);
    startTransition(() => router.refresh());
  }

  // ── Select helpers ────────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === visible.length
        ? new Set()
        : new Set(visible.map((o) => o.id))
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) return <OperationsTableSkeleton />;

  return (
    <>
      {/* Filter bar */}
      <OperationsFilterBar
        values={filters}
        sitios={sitios.map((s) => ({ id: s.id, name: s.name }))}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        className="mb-4"
      />

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg mb-3 animate-fade-in",
            "border border-[var(--color-primary)]",
            "bg-[rgba(98,111,71,0.06)]"
          )}
        >
          <span className="text-sm font-medium text-[var(--color-primary)]">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkUpdate("Completed")}
              isLoading={bulkLoading}
            >
              Mark Completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkUpdate("Missed")}
              isLoading={bulkLoading}
            >
              Mark Missed
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Day summary */}
      <DaySummaryBar operations={visible} />

      {/* Table */}
      {visible.length === 0 ? (
        <div className="empty-state py-16">
          <span className="empty-state__icon">📋</span>
          <p className="empty-state__title">No operations found</p>
          <p className="empty-state__desc">
            {operations.length === 0
              ? "No operations have been generated yet. Routes are created automatically at midnight."
              : "No operations match your current filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="data-table">
            <thead>
              <tr>
                {/* Select all */}
                <th className="w-10 px-4">
                  <input
                    type="checkbox"
                    checked={selected.size === visible.length && visible.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                    aria-label="Select all operations"
                  />
                </th>
                <th>Sitio</th>
                <th>Route</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Fuel (L)</th>
                <th className="text-right">Waste (kg)</th>
                <th>Notes</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((op) => {
                const isUpdating  = updatingId === op.id;
                const isSelected  = selected.has(op.id);

                return (
                  <tr
                    key={op.id}
                    className={cn(
                      isUpdating && "opacity-60 pointer-events-none",
                      isSelected && "bg-[rgba(98,111,71,0.04)]"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(op.id)}
                        className="rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                        aria-label={`Select ${op.sitio.name} ${op.operation_date}`}
                      />
                    </td>

                    {/* Sitio */}
                    <td className="font-medium text-[var(--color-text-primary)]">
                      {op.sitio.name}
                    </td>

                    {/* Route */}
                    <td className="text-[var(--color-text-secondary)] text-sm">
                      {op.schedule.route_name}
                    </td>

                    {/* Date */}
                    <td className="text-[var(--color-text-muted)] text-xs whitespace-nowrap">
                      {formatDateShort(op.operation_date)}
                    </td>

                    {/* Status — inline select */}
                    <td>
                      <StatusSelect
                        value={op.status}
                        onChange={(s) => handleStatusChange(op.id, s)}
                        disabled={isUpdating}
                      />
                    </td>

                    {/* Fuel */}
                    <td className="text-right text-sm text-[var(--color-text-secondary)]">
                      {op.fuel_consumed_l != null
                        ? <span>{op.fuel_consumed_l.toFixed(1)}</span>
                        : <span className="text-[var(--color-text-muted)]">—</span>
                      }
                    </td>

                    {/* Waste */}
                    <td className="text-right text-sm text-[var(--color-text-secondary)]">
                      {op.waste_volume_kg != null
                        ? <span>{op.waste_volume_kg.toFixed(1)}</span>
                        : <span className="text-[var(--color-text-muted)]">—</span>
                      }
                    </td>

                    {/* Notes */}
                    <td className="max-w-[160px]">
                      {op.notes
                        ? <span className="text-xs text-[var(--color-text-muted)] line-clamp-1" title={op.notes}>{op.notes}</span>
                        : <span className="text-[var(--color-text-muted)] text-xs">—</span>
                      }
                    </td>

                    {/* Edit */}
                    <td className="text-right">
                      <button
                        onClick={() => setEditOp(op)}
                        className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center ml-auto",
                          "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]",
                          "hover:bg-[var(--color-bg-table-stripe)] transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                        )}
                        aria-label={`Edit ${op.sitio.name} ${op.operation_date}`}
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Row count */}
      {visible.length > 0 && (
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Showing {visible.length} of {operations.length} operation{operations.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Resource update panel */}
      {editOp && (
        <ResourceUpdateForm
          operation={editOp}
          onClose={() => setEditOp(null)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function OperationsTableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-16 rounded-lg bg-[var(--color-border)]" />
      <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="h-10 bg-[var(--color-bg-table-stripe)]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-t border-[var(--color-border)]">
            <div className="h-4 w-4 rounded bg-[var(--color-border)]" />
            <div className="h-3.5 w-24 rounded bg-[var(--color-border)]" />
            <div className="h-3.5 w-32 rounded bg-[var(--color-border)]" />
            <div className="h-3.5 w-20 rounded bg-[var(--color-border)]" />
            <div className="h-6 w-24 rounded-full bg-[var(--color-border)]" />
            <div className="ml-auto h-3.5 w-12 rounded bg-[var(--color-border)]" />
            <div className="h-3.5 w-12 rounded bg-[var(--color-border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}