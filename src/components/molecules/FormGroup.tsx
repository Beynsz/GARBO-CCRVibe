/**
 * GARBO — FormGroup Molecule
 * SDD §3.2.2 FR-2.4 — Form group pairs a label with an input field.
 * Ensures clarity in data entry and supports error messaging.
 */

import { cn } from "@/lib/utils/cn";
import { Label } from "@/components/atoms/Label";

interface FormGroupProps {
  label:       string;
  htmlFor?:    string;
  required?:   boolean;
  error?:      string;
  hint?:       string;
  children:    React.ReactNode;
  className?:  string;
}

export function FormGroup({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FormGroupProps) {
  return (
    <div className={cn("w-full", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>

      {children}

      {/* Hint text (shown when no error) */}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{hint}</p>
      )}
    </div>
  );
}