"use client";

/**
 * GARBO — FilterBar Molecule
 * SRS §3.1.4.3 — Filter incident logs by date range or Sitio.
 * Reusable across Schedule, Operations, Incidents, and Reports pages.
 */

import { cn } from "@/lib/utils/cn";
import { Filter } from "lucide-react";
import type { OperationStatus, IncidentType } from "@/types/app.types";
import type { SitioRow } from "@/types/database.types";

// ─────────────────────────────────────────────────────────────────────────────
// Base select — consistent styling for all filter dropdowns
// ─────────────────────────────────────────────────────────────────────────────
interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label:     string;
  children:  React.ReactNode;
}

function FilterSelect({ label, children, className, ...props }: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </label>
      <select
        className={cn(
          "h-9 px-3 text-sm rounded-md border border-[var(--color-border)]",
          "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]",
          "focus:outline-none focus:border-[var(--color-border-focus)]",
          "focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20",
          "transition-colors duration-150 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Date input — consistent styling for date pickers
// ─────────────────────────────────────────────────────────────────────────────
interface FilterDateProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function FilterDate({ label, className, ...props }: FilterDateProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </label>
      <input
        type="date"
        className={cn(
          "h-9 px-3 text-sm rounded-md border border-[var(--color-border)]",
          "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]",
          "focus:outline-none focus:border-[var(--color-border-focus)]",
          "focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20",
          "transition-colors duration-150",
          className
        )}
        {...props}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset button
// ─────────────────────────────────────────────────────────────────────────────
function FilterResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 px-4 text-xs font-medium rounded-md mt-[22px]",
        "border border-[var(--color-border)] text-[var(--color-text-muted)]",
        "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
        "transition-colors duration-150 whitespace-nowrap"
      )}
    >
      Reset
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Operations FilterBar
// ─────────────────────────────────────────────────────────────────────────────
export interface OperationsFilterValues {
  from:    string;
  to:      string;
  sitioId: string;
  status:  string;
}

interface OperationsFilterBarProps {
  values:   OperationsFilterValues;
  sitios:   Pick<SitioRow, "id" | "name">[];
  onChange: (values: OperationsFilterValues) => void;
  onReset:  () => void;
  className?:string;
}

export function OperationsFilterBar({
  values,
  sitios,
  onChange,
  onReset,
  className,
}: OperationsFilterBarProps) {
  function handleChange(key: keyof OperationsFilterValues, val: string) {
    onChange({ ...values, [key]: val });
  }

  return (
    <FilterBarWrapper className={className}>
      <FilterDate
        label="From"
        value={values.from}
        onChange={(e) => handleChange("from", e.target.value)}
        max={values.to || undefined}
      />
      <FilterDate
        label="To"
        value={values.to}
        onChange={(e) => handleChange("to", e.target.value)}
        min={values.from || undefined}
      />
      <FilterSelect
        label="Sitio"
        value={values.sitioId}
        onChange={(e) => handleChange("sitioId", e.target.value)}
      >
        <option value="">All Sitios</option>
        {sitios.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Status"
        value={values.status}
        onChange={(e) => handleChange("status", e.target.value as OperationStatus)}
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Delayed">Delayed</option>
        <option value="Missed">Missed</option>
      </FilterSelect>
      <FilterResetButton onClick={onReset} />
    </FilterBarWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Incidents FilterBar
// ─────────────────────────────────────────────────────────────────────────────
export interface IncidentsFilterValues {
  from:         string;
  to:           string;
  sitioId:      string;
  incidentType: string;
}

interface IncidentsFilterBarProps {
  values:    IncidentsFilterValues;
  sitios:    Pick<SitioRow, "id" | "name">[];
  onChange:  (values: IncidentsFilterValues) => void;
  onReset:   () => void;
  className?: string;
}

export function IncidentsFilterBar({
  values,
  sitios,
  onChange,
  onReset,
  className,
}: IncidentsFilterBarProps) {
  function handleChange(key: keyof IncidentsFilterValues, val: string) {
    onChange({ ...values, [key]: val });
  }

  return (
    <FilterBarWrapper className={className}>
      <FilterDate
        label="From"
        value={values.from}
        onChange={(e) => handleChange("from", e.target.value)}
      />
      <FilterDate
        label="To"
        value={values.to}
        onChange={(e) => handleChange("to", e.target.value)}
      />
      <FilterSelect
        label="Sitio"
        value={values.sitioId}
        onChange={(e) => handleChange("sitioId", e.target.value)}
      >
        <option value="">All Sitios</option>
        {sitios.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Type"
        value={values.incidentType}
        onChange={(e) => handleChange("incidentType", e.target.value as IncidentType)}
      >
        <option value="">All Types</option>
        <option value="Missed Collection">Missed Collection</option>
        <option value="Illegal Dumping">Illegal Dumping</option>
        <option value="Vehicle Breakdown">Vehicle Breakdown</option>
        <option value="Other">Other</option>
      </FilterSelect>
      <FilterResetButton onClick={onReset} />
    </FilterBarWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared wrapper
// ─────────────────────────────────────────────────────────────────────────────
function FilterBarWrapper({
  children,
  className,
}: {
  children:  React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 p-4 rounded-lg",
        "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
        className
      )}
    >
      <Filter
        size={16}
        className="text-[var(--color-text-muted)] mt-[22px] shrink-0"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}