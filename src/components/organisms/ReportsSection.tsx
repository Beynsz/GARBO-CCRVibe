"use client";

/**
 * GARBO — ReportsSection Organism
 * SDD §4.1.5 — Reports & Analytics Section
 * Matches Image 7: KPI cards + incident log table + export buttons.
 * SRS §3.4.5.2 — Export monthly performance reports (CSV/PDF).
 * SRS §3.7.1 — Generate reports in under 5 seconds.
 */

import { useState }      from "react";
import { Download }      from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Button }        from "@/components/atoms/Button";
import { KpiCard }       from "@/components/molecules/KpiCard";
import { StatusPill }    from "@/components/atoms/StatusPill";
import { cn }            from "@/lib/utils/cn";
import { exportMonthlyReportCSV, exportMonthlyReportPDF } from "@/lib/utils/export";
import type { MonthlyReport } from "@/types/app.types";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface ReportsSectionProps {
  report:           MonthlyReport;
  availableMonths:  string[];
  selectedMonth:    string;
  onMonthChange:    (month: string) => void;
  isLoading?:       boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function ReportsSection({
  report,
  availableMonths,
  selectedMonth,
  onMonthChange,
  isLoading = false,
}: ReportsSectionProps) {
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  async function handleExportCSV() {
    setExportingCSV(true);
    try { exportMonthlyReportCSV(report); }
    finally { setTimeout(() => setExportingCSV(false), 800); }
  }

  async function handleExportPDF() {
    setExportingPDF(true);
    try { await exportMonthlyReportPDF(report); }
    finally { setExportingPDF(false); }
  }

  // Format "2026-04" → "April 2026"
  function formatMonthLabel(m: string) {
    const [y, mo] = m.split("-");
    if (!y || !mo) return m;
    return new Date(parseInt(y), parseInt(mo) - 1, 1)
      .toLocaleDateString("en-PH", { month: "long", year: "numeric" });
  }

  if (isLoading) return <ReportsSkeleton />;

  const rate = report.completionRate;
  const rateVariant = rate >= 80 ? "success" : rate >= 50 ? "warning" : "danger";

  return (
    <div className="space-y-6">

      {/* ── Report header + controls ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3
            className="text-base font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Key Performance Indicators — {formatMonthLabel(selectedMonth)}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {report.totalRoutes} total routes · {report.incidentCount} incidents
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Month picker */}
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className={cn(
              "h-9 px-3 text-sm rounded-md border border-[var(--color-border)]",
              "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]",
              "focus:outline-none focus:border-[var(--color-border-focus)]",
              "focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 cursor-pointer"
            )}
            aria-label="Select report month"
          >
            {availableMonths.length === 0 && (
              <option value={selectedMonth}>{formatMonthLabel(selectedMonth)}</option>
            )}
            {availableMonths.map((m) => (
              <option key={m} value={m}>{formatMonthLabel(m)}</option>
            ))}
          </select>

          {/* Export buttons */}
          <Button
            variant="outline" size="sm"
            onClick={handleExportCSV}
            isLoading={exportingCSV}
            leftIcon={<Download size={14} />}
          >
            CSV
          </Button>
          <Button
            variant="primary" size="sm"
            onClick={handleExportPDF}
            isLoading={exportingPDF}
            leftIcon={<Download size={14} />}
          >
            PDF
          </Button>
        </div>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Routes"    value={report.totalRoutes}    icon="schedule"   variant="default" />
        <KpiCard label="Completed"       value={report.completed}      icon="check-circle" variant="success" />
        <KpiCard label="Completion Rate" value={`${rate}%`}            icon="reports"    variant={rateVariant} />
        <KpiCard label="Missed"          value={report.missed}         icon="alert-triangle" variant={report.missed > 0 ? "danger" : "default"} />
        <KpiCard label="Delayed"         value={report.delayed}        icon="clock"      variant={report.delayed > 0 ? "warning" : "default"} />
        <KpiCard label="Total Waste"     value={`${report.totalWasteKg.toFixed(0)} kg`} icon="weight" variant="default" />
        <KpiCard label="Fuel Used"       value={`${report.totalFuelL.toFixed(0)} L`}    icon="fuel"   variant="default" />
        <KpiCard label="Incidents"       value={report.incidentCount}  icon="alert-circle" variant={report.incidentCount > 0 ? "warning" : "default"} />
      </div>

      {/* ── Weekly bar chart ──────────────────────────────────────── */}
      {report.byWeek.length > 0 && (
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Weekly Completion Rate
          </h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.byWeek} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="weekStart"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v: string) => v.slice(5)}   // "MM-DD"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, "Completion Rate"]}
                  contentStyle={{
                    fontSize: 12, borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg-surface)",
                  }}
                />
                <Bar dataKey="completionRate" radius={[4, 4, 0, 0]}>
                  {report.byWeek.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.completionRate >= 80
                        ? "var(--color-success)"
                        : entry.completionRate >= 50
                        ? "var(--color-warning)"
                        : "var(--color-danger)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── By-sitio table ────────────────────────────────────────── */}
      {report.bySitio.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-heading)" }}>
              Performance by Sitio
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sitio</th>
                  <th className="text-center">Completed</th>
                  <th className="text-center">Delayed</th>
                  <th className="text-center">Missed</th>
                  <th className="text-center">Rate</th>
                  <th className="text-right">Waste (kg)</th>
                </tr>
              </thead>
              <tbody>
                {report.bySitio.map((s) => (
                  <tr key={s.sitioId}>
                    <td className="font-medium text-[var(--color-text-primary)]">{s.sitioName}</td>
                    <td className="text-center text-[var(--color-success-text)] font-medium">{s.completed}</td>
                    <td className="text-center text-[var(--color-warning-text)]">{s.delayed}</td>
                    <td className="text-center text-[var(--color-danger-text)]">{s.missed}</td>
                    <td className="text-center">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          background: s.completionRate >= 80
                            ? "var(--color-success-bg)"
                            : s.completionRate >= 50
                            ? "var(--color-warning-bg)"
                            : "var(--color-danger-bg)",
                          color: s.completionRate >= 80
                            ? "var(--color-success-text)"
                            : s.completionRate >= 50
                            ? "var(--color-warning-text)"
                            : "var(--color-danger-text)",
                        }}
                      >
                        {s.completionRate}%
                      </span>
                    </td>
                    <td className="text-right text-[var(--color-text-secondary)] text-sm">
                      {s.wasteKg.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Weekly breakdown table ───────────────────────────────── */}
      {report.byWeek.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-heading)" }}>
              Incident Log Filtering
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Date</th>
                  <th>Incident Type</th>
                  <th>Reason / Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center py-6 text-sm text-[var(--color-text-muted)]">
                    Visit the{" "}
                    <a href="/alerts" className="text-[var(--color-primary)] hover:underline font-medium">
                      Alerts page
                    </a>{" "}
                    for the full filterable incident log.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 w-48 rounded bg-[var(--color-border)]" />
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-md bg-[var(--color-border)]" />
          <div className="h-9 w-16 rounded-md bg-[var(--color-border)]" />
          <div className="h-9 w-16 rounded-md bg-[var(--color-border)]" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="kpi-card border border-[var(--color-border)]">
            <div className="h-3 w-24 rounded bg-[var(--color-border)]" />
            <div className="h-8 w-16 rounded bg-[var(--color-border)] mt-2" />
          </div>
        ))}
      </div>
      <div className="h-[200px] rounded-xl bg-[var(--color-border)]" />
    </div>
  );
}