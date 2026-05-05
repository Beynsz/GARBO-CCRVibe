"use client";

/**
 * GARBO — AnnouncementForm Organism
 * SDD §4.1.4 — Announcement Management Panel
 * SRS §3.4.5.1 — Generate text summaries for public posting.
 * Includes a live public-text preview that auto-generates posting copy.
 */

import { useState }  from "react";
import { useRouter } from "next/navigation";
import { X, Copy, CheckCheck } from "lucide-react";
import { Button }    from "@/components/atoms/Button";
import { Input }     from "@/components/atoms/Input";
import { FormGroup } from "@/components/molecules/FormGroup";
import { cn }        from "@/lib/utils/cn";
import type { AnnouncementType } from "@/types/database.types";

const ANNOUNCEMENT_TYPES: AnnouncementType[] = [
  "Weather Delay", "Reminder", "Notice", "Cancellation", "Other",
];

const TYPE_EMOJI: Record<AnnouncementType, string> = {
  "Weather Delay": "🌧️",
  "Reminder":      "📌",
  "Notice":        "📢",
  "Cancellation":  "❌",
  "Other":         "ℹ️",
};

interface AnnouncementFormProps {
  onClose:    () => void;
  onSuccess?: () => void;
}

export function AnnouncementForm({ onClose, onSuccess }: AnnouncementFormProps) {
  const router = useRouter();

  const [type,     setType    ] = useState<AnnouncementType>("Notice");
  const [title,    setTitle   ] = useState("");
  const [body,     setBody    ] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors,   setErrors  ] = useState<{ title?: string; body?: string }>({});
  const [serverErr,setServerErr] = useState<string | null>(null);
  const [isLoading,setIsLoading] = useState(false);
  const [copied,   setCopied  ] = useState(false);

  // Live public-text preview
  const publicText = [
    `${TYPE_EMOJI[type]} GARBO — Barangay Banilad`,
    ``,
    `[${type.toUpperCase()}]`,
    title ? title : "(Title here)",
    ``,
    body  ? body  : "(Body here)",
    ``,
    `#GarboBanilad #CleanCommunity`,
  ].join("\n");

  async function handleCopy() {
    await navigator.clipboard.writeText(publicText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function validate() {
    const e: typeof errors = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!body.trim())  e.body  = "Body is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerErr(null);

    try {
      const res  = await fetch("/api/announcements", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type, title, body, is_active: isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setServerErr(json.message ?? json.error ?? "Failed."); return; }
      router.refresh();
      onSuccess?.();
      onClose();
    } catch { setServerErr("Network error."); }
    finally  { setIsLoading(false); }
  }

  return (
    <>
      <div className="fixed inset-0 z-[var(--z-overlay)] bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="fixed z-[var(--z-modal)] inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl bg-[var(--color-bg-surface)] rounded-xl shadow-[var(--shadow-modal)] border border-[var(--color-border)] animate-fade-in"
          role="dialog" aria-modal="true" aria-labelledby="ann-form-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <h2 id="ann-form-title" className="text-lg font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-heading)" }}>
              Create Announcement
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-table-stripe)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Form side */}
            <form onSubmit={handleSubmit} noValidate className="flex-1 px-6 py-5 space-y-5">
              {/* Type */}
              <div>
                <p className="form-label mb-2">Announcement Type</p>
                <div className="flex flex-wrap gap-2">
                  {ANNOUNCEMENT_TYPES.map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm font-medium border transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
                        type === t
                          ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] border-[var(--color-primary)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-secondary)]"
                      )}
                      aria-pressed={type === t}
                    >
                      {TYPE_EMOJI[t]} {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <FormGroup label="Title" htmlFor="ann-title" required error={errors.title}>
                <Input
                  id="ann-title"
                  placeholder="e.g. Collection delayed due to rain"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
                  error={errors.title}
                  disabled={isLoading}
                  maxLength={160}
                />
              </FormGroup>

              {/* Body */}
              <FormGroup label="Message Body" htmlFor="ann-body" required error={errors.body}>
                <div className="relative">
                  <textarea
                    id="ann-body" rows={4} maxLength={2000}
                    placeholder="Write the full announcement message…"
                    value={body}
                    onChange={(e) => { setBody(e.target.value); setErrors((p) => ({ ...p, body: undefined })); }}
                    disabled={isLoading}
                    className={cn("form-input resize-none h-auto leading-relaxed", errors.body && "form-input--error")}
                  />
                </div>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)] text-right">{body.length}/2000</p>
                {errors.body && <p className="text-xs text-[var(--color-danger)]" role="alert">⚠ {errors.body}</p>}
              </FormGroup>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button" role="switch" aria-checked={isActive}
                  onClick={() => setIsActive((p) => !p)}
                  disabled={isLoading}
                  className={cn(
                    "relative inline-flex w-11 h-6 rounded-full transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
                    isActive ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
                  )}
                >
                  <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200", isActive && "translate-x-5")} />
                </button>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {isActive ? "Publish immediately" : "Save as draft"}
                </span>
              </div>

              {serverErr && (
                <div className="alert-bar alert-bar--danger animate-fade-in" role="alert">
                  <span>✕</span><span className="text-sm">{serverErr}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isLoading}>Post Announcement</Button>
              </div>
            </form>

            {/* Preview side */}
            <div className="lg:w-72 px-6 py-5 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] bg-[var(--color-bg-page)] rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Public Text Preview
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline transition-colors focus-visible:outline-none"
                  aria-label="Copy public text"
                >
                  {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className={cn(
                "whitespace-pre-wrap text-xs leading-relaxed rounded-lg p-3",
                "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
                "text-[var(--color-text-secondary)] font-[var(--font-mono)]",
                "max-h-72 overflow-y-auto"
              )}>
                {publicText}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}