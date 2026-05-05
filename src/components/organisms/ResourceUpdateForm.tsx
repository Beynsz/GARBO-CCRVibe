"use client";

/**
 * GARBO — ResourceUpdateForm Organism
 * SRS §3.4.3.2 — Mark route status (Completed / Delayed / Missed).
 * SRS §3.4.3.3 — Input resource data: Fuel Consumed (L) and Waste Volume (kg).
 *
 * Rendered as a slide-in side panel from the OperationsTable row.
 * Designed so admins can log both status + resources in one focused interaction.
 */

import { useState, useEffect } from "react";
import { useRouter }    from "next/navigation";
import { X, Fuel, Weight, FileText } from "lucide-react";
import { Button }       from "@/components/atoms/Button";
import { Input }        from "@/components/atoms/Input";
import { FormGroup }    from "@/components/molecules/FormGroup";
import { StatusPill }   from "@/components/atoms/StatusPill";
import { cn }           from "@/lib/utils/cn";
import type { OperationWithDetails, OperationStatus } from "@/types/app.types";

const STATUSES: OperationStatus[] = ["Pending", "Completed", "Delayed", "Missed"];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface ResourceUpdateFormProps {
  operation:  OperationWithDetails;
  onClose:    () => void;
  onSuccess?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function ResourceUpdateForm({
  operation,
  onClose,
  onSuccess,
}: ResourceUpdateFormProps) {
  const router = useRouter();

  const [status,   setStatus  ] = useState<OperationStatus>(operation.status);
  const [fuel,     setFuel    ] = useState<string>(
    operation.fuel_consumed_l != null ? String(operation.fuel_consumed_l) : ""
  );
  const [waste,    setWaste   ] = useState<string>(
    operation.waste_volume_kg != null ? String(operation.waste_volume_kg) : ""
  );
  const [notes,    setNotes   ] = useState<string>(operation.notes ?? "");
  const [errors,   setErrors  ] = useState<{ fuel?: string; waste?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [isDirty,   setIsDirty ]      = useState(false);

  // Track if anything changed
  useEffect(() => {
    setIsDirty(
      status !== operation.status ||
      fuel   !== (operation.fuel_consumed_l != null ? String(operation.fuel_consumed_l) : "") ||
      waste  !== (operation.waste_volume_kg != null ? String(operation.waste_volume_kg) : "") ||
      notes  !== (operation.notes ?? "")
    );
  }, [status, fuel, waste, notes, operation]);

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (fuel !== "" && (isNaN(Number(fuel)) || Number(fuel) < 0)) {
      newErrors.fuel = "Enter a valid number (≥ 0).";
    }
    if (waste !== "" && (isNaN(Number(waste)) || Number(waste) < 0)) {
      newErrors.waste = "Enter a valid number (≥ 0).";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/operations/${operation.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          fuel_consumed_l: fuel  !== "" ? parseFloat(fuel)  : null,
          waste_volume_kg: waste !== "" ? parseFloat(waste) : null,
          notes:           notes.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.message ?? json.error ?? "Update failed.");
        return;
      }

      router.refresh();
      onSuccess?.();
      onClose();
    } catch {
      setServerError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[var(--z-overlay)] bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[var(--z-modal)] h-full w-full max-w-md",
          "bg-[var(--color-bg-surface)] shadow-[var(--shadow-modal)]",
          "flex flex-col animate-slide-in border-l border-[var(--color-border)]"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-form-title"
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2
              id="resource-form-title"
              className="text-base font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Update Operation
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              {operation.sitio.name} · {operation.schedule.route_name}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {operation.operation_date}
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
              "hover:bg-[var(--color-bg-table-stripe)] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
            )}
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Form ────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
        >
          {/* Status selector */}
          <div>
            <p className="form-label mb-2">Collection Status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-3 rounded-lg border text-sm font-medium",
                    "transition-all duration-150 focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
                    status === s
                      ? "border-[var(--color-primary)] bg-[rgba(98,111,71,0.06)] ring-1 ring-[var(--color-primary)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                  )}
                  aria-pressed={status === s}
                >
                  <StatusPill status={s} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Resource inputs */}
          <div className="space-y-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
            >
              Resource Data
            </p>

            {/* Fuel */}
            <FormGroup
              label="Fuel Consumed"
              htmlFor="fuel"
              hint="Litres used for this trip"
              error={errors.fuel}
            >
              <Input
                id="fuel"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="e.g. 15.5"
                value={fuel}
                onChange={(e) => {
                  setFuel(e.target.value);
                  setErrors((p) => ({ ...p, fuel: undefined }));
                }}
                error={errors.fuel}
                disabled={isLoading}
                leftIcon={<Fuel size={15} />}
              />
            </FormGroup>

            {/* Waste volume */}
            <FormGroup
              label="Waste Volume"
              htmlFor="waste"
              hint="Kilograms collected on this route"
              error={errors.waste}
            >
              <Input
                id="waste"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="e.g. 450.0"
                value={waste}
                onChange={(e) => {
                  setWaste(e.target.value);
                  setErrors((p) => ({ ...p, waste: undefined }));
                }}
                error={errors.waste}
                disabled={isLoading}
                leftIcon={<Weight size={15} />}
              />
            </FormGroup>
          </div>

          {/* Notes */}
          <FormGroup label="Notes" htmlFor="notes" hint="Optional — reason for delay/miss, observations">
            <div className="relative">
              <FileText
                size={15}
                className="absolute left-3 top-3 text-[var(--color-text-muted)] pointer-events-none"
                aria-hidden="true"
              />
              <textarea
                id="notes"
                rows={3}
                maxLength={500}
                placeholder="Add any notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                className={cn(
                  "form-input resize-none pl-9 py-2.5 h-auto",
                  "leading-relaxed"
                )}
              />
            </div>
            <p className="mt-1 text-[10px] text-[var(--color-text-muted)] text-right">
              {notes.length}/500
            </p>
          </FormGroup>

          {/* Server error */}
          {serverError && (
            <div className="alert-bar alert-bar--danger animate-fade-in" role="alert">
              <span aria-hidden="true">✕</span>
              <span className="text-sm">{serverError}</span>
            </div>
          )}
        </form>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!isDirty}
            onClick={handleSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>}
          >
            Save Update
          </Button>
        </div>
      </div>
    </>
  );
}