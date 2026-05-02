"use client";

/**
 * GARBO — IncidentForm Organism
 * SRS §3.4.4 — Log missed collections with reason tags, record illegal dumping.
 * Dynamic reason tags change based on selected incident type.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin } from "lucide-react";
import { Button }    from "@/components/atoms/Button";
import { Input }     from "@/components/atoms/Input";
import { FormGroup } from "@/components/molecules/FormGroup";
import { cn }        from "@/lib/utils/cn";
import { INCIDENT_REASON_TAGS } from "@/types/app.types";
import type { IncidentType, IncidentFormData } from "@/types/app.types";
import type { SitioRow } from "@/types/database.types";
import { todayISO } from "@/lib/utils/date";

const INCIDENT_TYPES: IncidentType[] = [
  "Missed Collection", "Illegal Dumping", "Vehicle Breakdown", "Other",
];

interface IncidentFormProps {
  sitios:     SitioRow[];
  onClose:    () => void;
  onSuccess?: () => void;
}

export function IncidentForm({ sitios, onClose, onSuccess }: IncidentFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<IncidentFormData>({
    sitio_id:             "",
    operation_id:         null,
    incident_type:        "Missed Collection",
    reason_tag:           "",
    location_description: "",
    incident_date:        todayISO(),
  });
  const [errors,      setErrors     ] = useState<Partial<Record<keyof IncidentFormData, string>>>({});
  const [serverError, setServerError ] = useState<string | null>(null);
  const [isLoading,   setIsLoading  ] = useState(false);

  const availableTags = INCIDENT_REASON_TAGS[form.incident_type] ?? ["Other"];

  function handleTypeChange(type: IncidentType) {
    setForm((p) => ({ ...p, incident_type: type, reason_tag: "" }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.sitio_id)    e.sitio_id      = "Please select a Sitio.";
    if (!form.reason_tag)  e.reason_tag    = "Please select a reason.";
    if (!form.incident_date) e.incident_date = "Date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerError(null);

    try {
      const res  = await fetch("/api/incidents", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setServerError(json.message ?? json.error ?? "Failed."); return; }
      router.refresh();
      onSuccess?.();
      onClose();
    } catch { setServerError("Network error."); }
    finally  { setIsLoading(false); }
  }

  return (
    <>
      <div className="fixed inset-0 z-[var(--z-overlay)] bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="fixed z-[var(--z-modal)] inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg bg-[var(--color-bg-surface)] rounded-xl shadow-[var(--shadow-modal)] border border-[var(--color-border)] animate-fade-in"
          role="dialog" aria-modal="true" aria-labelledby="incident-form-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <h2 id="incident-form-title" className="text-lg font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-heading)" }}>
              Log Incident
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-table-stripe)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Incident type */}
              <div>
                <p className="form-label mb-2">Incident Type <span className="text-[var(--color-danger)]">*</span></p>
                <div className="grid grid-cols-2 gap-2">
                  {INCIDENT_TYPES.map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => handleTypeChange(t)}
                      className={cn(
                        "px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
                        form.incident_type === t
                          ? "border-[var(--color-danger)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] ring-1 ring-[var(--color-danger)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                      )}
                      aria-pressed={form.incident_type === t}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sitio */}
              <FormGroup label="Sitio / Location" htmlFor="sitio_id" required error={errors.sitio_id}>
                <select
                  id="sitio_id" value={form.sitio_id}
                  onChange={(e) => { setForm((p) => ({ ...p, sitio_id: e.target.value })); setErrors((p) => ({ ...p, sitio_id: undefined })); }}
                  disabled={isLoading}
                  className={cn("form-input", errors.sitio_id && "form-input--error")}
                >
                  <option value="">Select a Sitio…</option>
                  {sitios.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.sitio_id && <p className="mt-1.5 text-xs text-[var(--color-danger)]" role="alert">⚠ {errors.sitio_id}</p>}
              </FormGroup>

              {/* Reason tag */}
              <div>
                <p className="form-label mb-2">Reason <span className="text-[var(--color-danger)]">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag} type="button"
                      onClick={() => { setForm((p) => ({ ...p, reason_tag: tag })); setErrors((p) => ({ ...p, reason_tag: undefined })); }}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm font-medium border transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
                        form.reason_tag === tag
                          ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] border-[var(--color-primary)]"
                          : "bg-[var(--color-bg-page)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                      )}
                      aria-pressed={form.reason_tag === tag}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {errors.reason_tag && <p className="mt-1.5 text-xs text-[var(--color-danger)]" role="alert">⚠ {errors.reason_tag}</p>}
              </div>

              {/* Incident date */}
              <FormGroup label="Incident Date" htmlFor="incident_date" required error={errors.incident_date}>
                <Input
                  id="incident_date" type="date"
                  value={form.incident_date}
                  onChange={(e) => { setForm((p) => ({ ...p, incident_date: e.target.value })); setErrors((p) => ({ ...p, incident_date: undefined })); }}
                  disabled={isLoading}
                  error={errors.incident_date}
                />
              </FormGroup>

              {/* Location description */}
              <FormGroup label="Location Description" htmlFor="location_description" hint="Optional — describe the exact location for illegal dumping reports">
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-3 text-[var(--color-text-muted)] pointer-events-none" aria-hidden="true" />
                  <textarea
                    id="location_description" rows={2}
                    placeholder="e.g. Near the creek behind Sitio Mahiga…"
                    value={form.location_description ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, location_description: e.target.value }))}
                    disabled={isLoading}
                    className="form-input resize-none pl-9 py-2.5 h-auto leading-relaxed"
                    maxLength={300}
                  />
                </div>
              </FormGroup>

              {serverError && (
                <div className="alert-bar alert-bar--danger animate-fade-in" role="alert">
                  <span aria-hidden="true">✕</span>
                  <span className="text-sm">{serverError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="danger" isLoading={isLoading}>Log Incident</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}