"use client";

/**
 * GARBO — LogbookClient
 * Client shell for the Logbook page.
 * Provides the "Generate Today's Routes" button and wraps OperationsTable.
 * SDD §3.7.1.2 — Logbook: tabular view for editing historical trip records.
 */

import { useState, useTransition } from "react";
import { useRouter }         from "next/navigation";
import { RefreshCw }         from "lucide-react";
import { Button }            from "@/components/atoms/Button";
import { OperationsTable }   from "@/components/organisms/OperationsTable";
import { cn }                from "@/lib/utils/cn";
import type { OperationWithDetails } from "@/types/app.types";
import type { SitioRow }             from "@/types/database.types";
import { todayISO, formatDateWithDay } from "@/lib/utils/date";

interface LogbookClientProps {
  operations: OperationWithDetails[];
  sitios:     SitioRow[];
}

export function LogbookClient({ operations, sitios }: LogbookClientProps) {
  const router              = useRouter();
  const [, startTransition] = useTransition();
  const [generating,  setGenerating ] = useState(false);
  const [genMessage,  setGenMessage ] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setGenMessage(null);

    try {
      const res  = await fetch("/api/operations/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ date: todayISO() }),
      });
      const json = await res.json();
      setGenMessage(json.message ?? (json.success ? "Done." : "Failed."));
      startTransition(() => router.refresh());
    } catch {
      setGenMessage("Network error. Please try again.");
    } finally {
      setGenerating(false);
      // Auto-clear after 5s
      setTimeout(() => setGenMessage(null), 5000);
    }
  }

  return (
    <div className="animate-fade-in max-w-[1360px]">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h2 className="page-header__title">Logbook</h2>
          <p className="page-header__subtitle">
            Historical trip records — last 30 days · {operations.length} operations
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Generate today's routes button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            isLoading={generating}
            leftIcon={<RefreshCw size={14} />}
          >
            Generate Today&apos;s Routes
          </Button>
        </div>
      </div>

      {/* Generate feedback */}
      {genMessage && (
        <div
          className={cn(
            "alert-bar mb-4 animate-fade-in",
            genMessage.toLowerCase().includes("fail") || genMessage.toLowerCase().includes("error")
              ? "alert-bar--danger"
              : "alert-bar--success"
          )}
          role="status"
        >
          <span className="text-sm">{genMessage}</span>
        </div>
      )}

      {/* Today heading */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Showing: last 30 days
        </span>
        <span className="text-[var(--color-text-muted)] text-xs">·</span>
        <span className="text-xs text-[var(--color-text-muted)]">
          Today: {formatDateWithDay(todayISO())}
        </span>
      </div>

      {/* Full operations table */}
      <OperationsTable
        operations={operations}
        sitios={sitios}
      />
    </div>
  );
}