"use client";

/**
 * GARBO — Dashboard Error Boundary
 * Catches render/fetch errors within the /(dashboard) route group.
 */

import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("[GARBO] Dashboard error:", error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6"
      role="alert"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--color-danger-bg)" }}
      >
        <AlertTriangle
          size={28}
          style={{ color: "var(--color-danger)" }}
          aria-hidden="true"
        />
      </div>

      <div className="max-w-sm">
        <h2
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-text-primary)" }}
        >
          Something went wrong
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          An unexpected error occurred while loading this page. Your data is safe.
        </p>
        {error.digest && (
          <p className="text-xs mt-2 font-mono" style={{ color: "var(--color-text-muted)" }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/home"}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}