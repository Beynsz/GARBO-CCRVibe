"use client";

/**
 * GARBO — Input Atom
 * SDD §3.2.1 FR-1.2 — Input fields capture user credentials and form data.
 * Includes placeholder text, validation states (error, active, disabled).
 * Supports password toggle (show/hide).
 */

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?:      string;
  leftIcon?:   React.ReactNode;
  rightIcon?:  React.ReactNode;
  /** Show password toggle button — only effective when type="password" */
  showPasswordToggle?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      type = "text",
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword     = type === "password";
    const resolvedType   = isPassword && showPassword ? "text" : type;
    const hasLeftIcon    = !!leftIcon;
    const hasRightContent= !!rightIcon || (isPassword && showPasswordToggle);

    return (
      <div className="relative w-full">
        {/* Left icon */}
        {hasLeftIcon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={resolvedType}
          disabled={disabled}
          className={cn(
            // Base styles
            "w-full h-11 font-[var(--font-body)] text-sm rounded-md",
            "bg-[var(--color-bg-input)] text-[var(--color-text-primary)]",
            "border border-[var(--color-border)]",
            "placeholder:text-[var(--color-text-muted)]",
            "transition-all duration-150 outline-none",
            // Padding — adjust for icons
            hasLeftIcon    ? "pl-10" : "pl-4",
            hasRightContent? "pr-10" : "pr-4",
            "py-2.5",
            // Focus
            "focus:border-[var(--color-border-focus)] focus:shadow-[var(--shadow-input-focus)]",
            // Error
            error && "border-[var(--color-danger)] focus:shadow-[0_0_0_3px_rgba(244,67,54,0.15)]",
            // Disabled
            disabled && "bg-[var(--color-bg-table-stripe)] text-[var(--color-text-muted)] cursor-not-allowed",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id ?? props.name}-error` : undefined}
          {...props}
        />

        {/* Right: custom icon or password toggle */}
        {hasRightContent && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {isPassword && showPasswordToggle ? (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={cn(
                  "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                  "transition-colors duration-150 focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] rounded-sm"
                )}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            ) : (
              <span className="text-[var(--color-text-muted)] pointer-events-none" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </span>
        )}

        {/* Error message */}
        {error && (
          <p
            id={`${props.id ?? props.name}-error`}
            role="alert"
            className="mt-1.5 text-xs text-[var(--color-danger)] flex items-center gap-1"
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";