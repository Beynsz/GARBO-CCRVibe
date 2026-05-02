"use client";

/**
 * GARBO — ScheduleTable Organism
 * SDD §4.1.3 — Collection Schedule Table
 * Matches Image 4: table with Sitio, Collection Day, Status columns + row-level filters.
 * Supports inline activate/deactivate toggle and edit/delete actions.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ScheduleForm } from "@/components/organisms/ScheduleForm";
import { cn } from "@/lib/utils/cn";
import type { ScheduleWithSitio } from "@/types/app.types";
import type { SitioRow } from "@/types/database.types";
import { DAYS_OF_WEEK } from "@/types/app.types";

// ─────────────────────────────────────────────────────────────────────────────
// Filter bar — day + sitio + status
// ─────────────────────────────────────────────────────────────────────────────
interface TableFilters {
  day:     string;
  sitioId: string;
  status:  string;
}

interface FilterRowProps {
  filters:   TableFilters;
  sitios:    Pick<SitioRow, "id" | "name">[];
  onChange:  (f: TableFilters) => void;
}

function FilterRow({ filters, sitios, onChange }: FilterRowProps) {
  const selectCls = cn(
    "h-9 px-3 text-sm rounded-md border border-[var(--color-border)]",
    "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]",
    "focus:outline-none focus:border-[var(--color-border-focus)]",
    "focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20",
    "cursor-pointer transition-colors"
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Day filter */}
      <select
        value={filters.day}
        onChange={(e) => onChange({ ...filters, day: e.target.value })}
        className={selectCls}
        aria-label="Filter by day"
      >
        <option value="">Days ▾</option>
        {DAYS_OF_WEEK.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Sitio filter */}
      <select
        value={filters.sitioId}
        onChange={(e) => onChange({ ...filters, sitioId: e.target.value })}
        className={selectCls}
        aria-label="Filter by sitio"
      >
        <option value="">All Sitios</option>
        {sitios.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className={selectCls}
        aria-label="Filter by status"
      >
        <option value="">All Routes</option>
        <option value="active">Active only</option>
        <option value="inactive">Inactive only</option>
      </select>

      {/* Reset */}
      {(filters.day || filters.sitioId || filters.status) && (
        <button
          onClick={() => onChange({ day: "", sitioId: "", status: "" })}
          className="h-9 px-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm-delete dialog (inline, no external library)
// ─────────────────────────────────────────────────────────────────────────────
interface ConfirmDeleteProps {
  routeName: string;
  onConfirm: () => void;
  onCancel:  () => void;
  isLoading: boolean;
}

function ConfirmDelete({ routeName, onConfirm, onCancel, isLoading }: ConfirmDeleteProps) {
  return (
    <>
      <div className="fixed inset-0 z-[var(--z-overlay)] bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div className="fixed z-[var(--z-modal)] inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto w-full max-w-sm p-6 rounded-xl",
            "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
            "shadow-[var(--shadow-modal)] animate-fade-in"
          )}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--color-danger-bg)" }}
          >
            <Trash2 size={22} style={{ color: "var(--color-danger)" }} />
          </div>
          <h3 id="confirm-title" className="text-center text-base font-bold text-[var(--color-text-primary)] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}>
            Delete Schedule?
          </h3>
          <p className="text-center text-sm text-[var(--color-text-muted)] mb-6">
            <strong className="text-[var(--color-text-primary)]">{routeName}</strong> will be
            permanently removed and cannot be recovered.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={onConfirm} isLoading={isLoading}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main table component
// ─────────────────────────────────────────────────────────────────────────────
interface ScheduleTableProps {
  schedules:   ScheduleWithSitio[];
  sitios:      SitioRow[];
  isLoading?:  boolean;
}

export function ScheduleTable({ schedules, sitios, isLoading = false }: ScheduleTableProps) {
  const router              = useRouter();
  const [, startTransition] = useTransition();

  const [filters, setFilters]         = useState<TableFilters>({ day: "", sitioId: "", status: "" });
  const [editTarget, setEditTarget]   = useState<ScheduleWithSitio | null>(null);
  const [showForm,   setShowForm]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleWithSitio | null>(null);
  const [deleting,   setDeleting]     = useState(false);
  const [actionOpen, setActionOpen]   = useState<string | null>(null);

  // ── Client-side filtering ─────────────────────────────────────────────────
  const visible = schedules.filter((s) => {
    if (filters.day     && !s.collection_days.includes(filters.day)) return false;
    if (filters.sitioId && s.sitio_id !== filters.sitioId)           return false;
    if (filters.status === "active"   && !s.is_active) return false;
    if (filters.status === "inactive" &&  s.is_active) return false;
    return true;
  });

  // ── Toggle active ─────────────────────────────────────────────────────────
  async function handleToggleActive(schedule: ScheduleWithSitio) {
    await fetch(`/api/schedules/${schedule.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ is_active: !schedule.is_active }),
    });
    startTransition(() => router.refresh());
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/schedules/${deleteTarget.id}?hard=true`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    startTransition(() => router.refresh());
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) return <ScheduleTableSkeleton />;

  return (
    <>
      {/* Filter row */}
      <FilterRow filters={filters} sitios={sitios} onChange={setFilters} />

      {/* Table */}
      {visible.length === 0 ? (
        <div className="empty-state py-16">
          <span className="empty-state__icon">📅</span>
          <p className="empty-state__title">No schedules found</p>
          <p className="empty-state__desc">
            {schedules.length === 0
              ? "Create your first collection schedule to get started."
              : "No schedules match your current filters."}
          </p>
          {schedules.length === 0 && (
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={() => { setEditTarget(null); setShowForm(true); }}
            >
              + New Schedule
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sitio</th>
                <th>Route Name</th>
                <th>Collection Days</th>
                <th>Frequency</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id}>
                  {/* Sitio */}
                  <td className="font-medium text-[var(--color-text-primary)]">
                    {s.sitio.name}
                  </td>

                  {/* Route name */}
                  <td className="text-[var(--color-text-secondary)]">
                    {s.route_name}
                  </td>

                  {/* Collection days — pill per day */}
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {s.collection_days.map((d) => (
                        <span
                          key={d}
                          className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded"
                          style={{
                            background: "var(--color-olive-100, #EBF0D4)",
                            color:      "var(--color-primary)",
                          }}
                        >
                          {d.slice(0, 3).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Frequency */}
                  <td className="text-sm text-[var(--color-text-muted)]">
                    {s.frequency}
                  </td>

                  {/* Status */}
                  <td>
                    <button
                      onClick={() => handleToggleActive(s)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-full"
                      aria-label={`${s.is_active ? "Deactivate" : "Activate"} ${s.route_name}`}
                    >
                      <Badge
                        variant={s.is_active ? "success" : "default"}
                        dot
                      >
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActionOpen(actionOpen === s.id ? null : s.id)}
                        className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center",
                          "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                          "hover:bg-[var(--color-bg-table-stripe)] transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                        )}
                        aria-label={`Actions for ${s.route_name}`}
                        aria-expanded={actionOpen === s.id}
                        aria-haspopup="menu"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {/* Dropdown */}
                      {actionOpen === s.id && (
                        <>
                          <div className="fixed inset-0 z-[var(--z-dropdown)]" onClick={() => setActionOpen(null)} aria-hidden="true" />
                          <div
                            className={cn(
                              "absolute right-0 top-full mt-1 w-40 z-[calc(var(--z-dropdown)+1)]",
                              "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
                              "rounded-lg shadow-[var(--shadow-modal)] overflow-hidden animate-fade-in"
                            )}
                            role="menu"
                          >
                            <button
                              onClick={() => { setEditTarget(s); setShowForm(true); setActionOpen(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-table-stripe)] transition-colors"
                              role="menuitem"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(s); setActionOpen(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                              role="menuitem"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Row count */}
      {visible.length > 0 && (
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Showing {visible.length} of {schedules.length} schedule{schedules.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <ScheduleForm
          sitios={sitios}
          schedule={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDelete
          routeName={deleteTarget.route_name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={deleting}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function ScheduleTableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-2">
        {[100, 120, 100].map((w, i) => (
          <div key={i} className="h-9 rounded-md bg-[var(--color-border)]" style={{ width: w }} />
        ))}
      </div>
      <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="h-10 bg-[var(--color-bg-table-stripe)]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-t border-[var(--color-border)]">
            <div className="h-3.5 w-24 rounded bg-[var(--color-border)]" />
            <div className="h-3.5 w-36 rounded bg-[var(--color-border)]" />
            <div className="flex gap-1">
              <div className="h-5 w-10 rounded bg-[var(--color-border)]" />
              <div className="h-5 w-10 rounded bg-[var(--color-border)]" />
            </div>
            <div className="h-3.5 w-16 rounded bg-[var(--color-border)]" />
            <div className="h-5 w-16 rounded-full bg-[var(--color-border)]" />
            <div className="ml-auto h-7 w-7 rounded bg-[var(--color-border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}