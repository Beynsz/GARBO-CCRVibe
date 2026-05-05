/**
 * GARBO — Label Atom
 * SDD §3.2.1 FR-1.4 — Labels identify input fields and provide context.
 */

import { cn } from "@/lib/utils/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, children, className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5",
        "font-[var(--font-body)]",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-[var(--color-danger)]" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}