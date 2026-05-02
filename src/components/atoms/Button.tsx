"use client";

/**
 * GARBO — Button Atom
 * SDD §3.2.1 FR-1.1 — Buttons trigger user actions.
 * Primary color: #626F47 dark olive green.
 * Includes hover, disabled, and loading states.
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  isLoading?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] " +
    "hover:bg-[var(--color-primary-dark)] active:scale-[0.98] " +
    "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 " +
    "shadow-sm",

  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-text-on-primary)] " +
    "hover:bg-[var(--color-primary)] active:scale-[0.98] " +
    "focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 " +
    "shadow-sm",

  outline:
    "bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] " +
    "hover:bg-[var(--color-primary)] hover:text-[var(--color-text-on-primary)] " +
    "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",

  ghost:
    "bg-transparent text-[var(--color-text-secondary)] " +
    "hover:bg-[var(--color-bg-table-stripe)] hover:text-[var(--color-text-primary)] " +
    "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--color-border)] focus-visible:ring-offset-2",

  danger:
    "bg-[var(--color-danger)] text-white " +
    "hover:bg-[var(--color-danger-dark)] active:scale-[0.98] " +
    "focus-visible:ring-2 focus-visible:ring-[var(--color-danger)] focus-visible:ring-offset-2 " +
    "shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:  "h-8  px-3   text-xs  gap-1.5 rounded-md",
  md:  "h-10 px-4   text-sm  gap-2   rounded-md",
  lg:  "h-12 px-6   text-base gap-2  rounded-lg",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = "primary",
      size      = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-medium font-[var(--font-body)]",
          "transition-all duration-150 cursor-pointer select-none",
          "outline-none focus-visible:outline-none",
          // Variant + Size
          variantStyles[variant],
          sizeStyles[size],
          // States
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          fullWidth  && "w-full",
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Label */}
        {children && (
          <span className={cn(isLoading && "opacity-0 absolute")}>{children}</span>
        )}

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";