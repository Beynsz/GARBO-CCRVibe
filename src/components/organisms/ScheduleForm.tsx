"use client";

/**
 * GARBO — ScheduleForm Organism
 * Modal form for creating and editing recurring collection routes.
 * SRS §3.4.2.1 — Create, edit recurring routes.
 * SRS §3.4.2.2 — Assign specific Sitios to routes.
 * SDD §4.1.3 — Collection Schedule Table (create/edit controls).
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button }    from "@/components/atoms/Button";
import { Input }     from "@/components/atoms/Input";
import { Label }     from "@/components/atoms/Label";
import { FormGroup } from "@/components/molecules/FormGroup";
import { cn } from "@/lib/utils/cn";
import { DAYS_OF_WEEK } from "@/types/app.types";
import type { SitioRow } from "@/types/database.types";
import type { ScheduleWithSitio, ScheduleFormData } from "@/types/app.types";

const FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface ScheduleFormProps {
  sitios:      SitioRow[];
  schedule?:   ScheduleWithSitio | null;   // null = create mode
  onClose:     () => void;
  onSuccess?:  () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default form state
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT: ScheduleFormData = {
  sitio_id:        "",
  route_name:      "",
  collection_days: [],
  frequency:       "Weekly",
  is_active:       true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function ScheduleForm({
  sitios,
  schedule,
  onClose,
  onSuccess,
}: ScheduleFormProps) {
  const router    = useRouter();
  const isEditing = !!schedule;

  const [form, setForm]         = useState<ScheduleFormData>(
    schedule
      ? {
          sitio_id:        schedule.sitio_id,
          route_name:      schedule.route_name,
          collection_days: schedule.collection_days,
          frequency:       schedule.frequency,
          is_active:       schedule.is_active,
        }
      : DEFAULT
  );
  const [errors,      setErrors     ] = useState<Partial<Record<keyof ScheduleFormData, string>>>({});
  const [serverError, setServerError ] = useState<string | null>(null);
  const [isLoading,   setIsLoading  ] = useState(false);

  // Reset errors when form changes
  useEffect(() => { setServerError(null); }, [form]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      collection_days: prev.collection_days.includes(day)
        ? prev.collection_days.filter((d) => d !== day)
        : [...prev.collection_days, day],
    }));
    setErrors((prev) => ({ ...prev, collection_days: undefined }));
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.sitio_id)              newErrors.sitio_id        = "Please select a Sitio.";
    if (!form.route_name.trim())     newErrors.route_name      = "Route name is required.";
    if (form.collection_days.length === 0)
                                     newErrors.collection_days = "Select at least one collection day.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError(null);

    try {
      const url    = isEditing ? `/api/schedules/${schedule!.id}` : "/api/schedules";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.message ?? json.error ?? "Something went wrong.");
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
        className="fixed inset-0 z-[var(--z-overlay)] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed z-[var(--z-modal)] inset-0 flex items-center justify-center p-4",
          "pointer-events-none"
        )}
      >
        <div
          className={cn(
            "pointer-events-auto w-full max-w-lg",
            "bg-[var(--color-bg-surface)] rounded-xl shadow-[var(--shadow-modal)]",
            "border border-[var(--color-border)]",
            "animate-fade-in"
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-form-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <h2
              id="schedule-form-title"
              className="text-lg font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {isEditing ? "Edit Schedule" : "New Collection Schedule"}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center",
                "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                "hover:bg-[var(--color-bg-table-stripe)] transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
              )}
              aria-label="Close"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-5">

              {/* Sitio */}
              <FormGroup label="Sitio" htmlFor="sitio_id" required error={errors.sitio_id}>
                <select
                  id="sitio_id"
                  value={form.sitio_id}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, sitio_id: e.target.value }));
                    setErrors((p) => ({ ...p, sitio_id: undefined }));
                  }}
                  disabled={isLoading}
                  className={cn(
                    "form-input",
                    errors.sitio_id && "form-input--error"
                  )}
                  aria-required="true"
                >
                  <option value="">Select a Sitio…</option>
                  {sitios.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.sitio_id && (
                  <p className="mt-1.5 text-xs text-[var(--color-danger)]" role="alert">
                    ⚠ {errors.sitio_id}
                  </p>
                )}
              </FormGroup>

              {/* Route name */}
              <FormGroup label="Route Name" htmlFor="route_name" required error={errors.route_name}>
                <Input
                  id="route_name"
                  value={form.route_name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, route_name: e.target.value }));
                    setErrors((p) => ({ ...p, route_name: undefined }));
                  }}
                  placeholder="e.g. Morning Route A"
                  disabled={isLoading}
                  error={errors.route_name}
                />
              </FormGroup>

              {/* Collection days */}
              <div>
                <Label required>Collection Days</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const checked = form.collection_days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        disabled={isLoading}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                          "border focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-1",
                          checked
                            ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] border-[var(--color-primary)]"
                            : "bg-[var(--color-bg-page)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        )}
                        aria-pressed={checked}
                        aria-label={`${checked ? "Remove" : "Add"} ${day}`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                {errors.collection_days && (
                  <p className="mt-1.5 text-xs text-[var(--color-danger)]" role="alert">
                    ⚠ {errors.collection_days}
                  </p>
                )}
              </div>

              {/* Frequency */}
              <FormGroup label="Frequency" htmlFor="frequency">
                <select
                  id="frequency"
                  value={form.frequency}
                  onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
                  disabled={isLoading}
                  className="form-input"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </FormGroup>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_active}
                  onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                  disabled={isLoading}
                  className={cn(
                    "relative inline-flex w-11 h-6 rounded-full transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
                    form.is_active
                      ? "bg-[var(--color-primary)]"
                      : "bg-[var(--color-border)]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
                      form.is_active && "translate-x-5"
                    )}
                  />
                </button>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {form.is_active ? "Active" : "Inactive"} — route will{" "}
                  {form.is_active ? "" : "not "}be included in daily task generation
                </span>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="alert-bar alert-bar--danger animate-fade-in" role="alert">
                  <span aria-hidden="true">✕</span>
                  <span className="text-sm">{serverError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>
                {isEditing ? "Save Changes" : "Create Schedule"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}