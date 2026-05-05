"use client";

/**
 * GARBO — IncidentLogTable Organism
 * SRS §3.4.4.3 — Filter incident logs by date range or Sitio.
 * Matches Image 6 aesthetic: coloured left-border rows, type badges.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Waves, Truck, HelpCircle } from "lucide-react";
import { Badge }                from "@/components/atoms/Badge";
import { Button }               from "@/components/atoms/Button";
import { IncidentsFilterBar }   from "@/components/molecules/FilterBar";
import { cn }                   from "@/lib/utils/cn";
import { formatDateShort, formatRelative } from "@/lib/utils/date";
import type { IncidentWithSitio, IncidentType, IncidentsFilterValues } from "@/types/app.types";
import type { SitioRow } from "@/types/database.types";

// Incident type visual config
const TYPE_CONFIG: Record<IncidentType, {
  icon: React.ElementType; borderColor: string; badgeVariant: "danger" | "warning" | "info" | "default";
}> = {
  "Missed Collection":  { icon: AlertTriangle, borderColor: "var(--color-warning)", badgeVariant: "warning" },
  "Illegal Dumping":    { icon: Waves,         borderColor: "var(--color-danger)",  badgeVariant: "danger"  },
  "Vehicle Breakdown":  { icon: Truck,         borderColor: "var(--color-info)",    badgeVariant: "info"    },
  "Other":              { icon: HelpCircle,    borderColor: "var(--color-border)",  badgeVariant: "default" },
};

const DEFAULT_FILTERS: IncidentsFilterValues = { from: "", to: "", sitioId: "", incidentType: "" };

interface IncidentLogTableProps {
  incidents:  IncidentWithSitio[];
  sitios:     SitioRow[];
  isLoading?: boolean;
}

export function IncidentLogTable({ incidents, sitios, isLoading = false }: IncidentLogTableProps) {
  const router              = useRouter();
  const [, startTransition] = useTransition();
  const [filters,   setFilters  ] = useState<IncidentsFilterValues>(DEFAULT_FILTERS);
  const [deletingId,setDeletingId] = useState<string | null>(null);

  // Client-side filter
  const visible = incidents.filter((inc) => {
    if (filters.from         && inc.incident_date < filters.from)                       return false;
    if (filters.to           && inc.incident_date > filters.to)                         return false;
    if (filters.sitioId      && inc.sitio_id !== filters.sitioId)                       return false;
    if (filters.incidentType && inc.incident_type !== filters.incidentType)             return false;
    return true;
  });

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this incident record?")) return;
    setDeletingId(id);
    await fetch(`/api/incidents/${id}`, { method: "DELETE" });
    setDeletingId(null);
    startTransition(() => router.refresh());
  }

  if (isLoading) return <IncidentLogSkeleton />;

  return (
    <>
      <IncidentsFilterBar
        values={filters}
        sitios={sitios.map((s) => ({ id: s.id, name: s.name }))}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        className="mb-4"
      />

      {/* Summary strip */}
      {visible.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          {(["Missed Collection", "Illegal Dumping", "Vehicle Breakdown", "Other"] as IncidentType[]).map((type) => {
            const count = visible.filter((i) => i.incident_type === type).length;
            if (!count) return null;
            const cfg = TYPE_CONFIG[type];
            return (
              <Badge key={type} variant={cfg.badgeVariant} dot>
                {count} {type}
              </Badge>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="empty-state py-16">
          <span className="empty-state__icon">✅</span>
          <p className="empty-state__title">
            {incidents.length === 0 ? "No incidents logged" : "No incidents match filters"}
          </p>
          <p className="empty-state__desc">
            {incidents.length === 0 && "Use the Log Incident button to record missed collections or illegal dumping."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((inc) => {
            const cfg      = TYPE_CONFIG[inc.incident_type as IncidentType] ?? TYPE_CONFIG["Other"]!;
            const TypeIcon = cfg.icon;
            const isDeleting = deletingId === inc.id;

            return (
              <div
                key={inc.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border-l-4",
                  "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
                  "transition-all duration-150 hover:shadow-[var(--shadow-card)]",
                  isDeleting && "opacity-50 pointer-events-none"
                )}
                style={{ borderLeftColor: cfg.borderColor }}
              >
                {/* Icon */}
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `color-mix(in srgb, ${cfg.borderColor} 15%, transparent)` }}
                >
                  <TypeIcon size={16} style={{ color: cfg.borderColor }} aria-hidden="true" />
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={cfg.badgeVariant}>{inc.incident_type}</Badge>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ background: "var(--color-bg-table-stripe)", color: "var(--color-text-secondary)" }}
                        >
                          {inc.reason_tag}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)] mt-1">
                        {inc.sitio.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {formatDateShort(inc.incident_date)}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)] opacity-70">
                          {formatRelative(inc.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(inc.id)}
                        className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center",
                          "text-[var(--color-text-muted)] hover:text-[var(--color-danger)]",
                          "hover:bg-[var(--color-danger-bg)] transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]"
                        )}
                        aria-label="Delete incident"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {inc.location_description && (
                    <p className="mt-1.5 text-xs text-[var(--color-text-muted)] leading-relaxed">
                      📍 {inc.location_description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {visible.length > 0 && (
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          Showing {visible.length} of {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
        </p>
      )}
    </>
  );
}

function IncidentLogSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-16 rounded-lg bg-[var(--color-border)]" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="w-9 h-9 rounded-full bg-[var(--color-border)] shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="h-5 w-28 rounded-full bg-[var(--color-border)]" />
              <div className="h-5 w-20 rounded bg-[var(--color-border)]" />
            </div>
            <div className="h-3.5 w-32 rounded bg-[var(--color-border)]" />
          </div>
        </div>
      ))}
    </div>
  );
}