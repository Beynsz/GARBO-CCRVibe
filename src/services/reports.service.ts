/**
 * GARBO — Reports Service
 * SRS §3.4.5 — Generate monthly performance reports (Completion Rate vs. Missed).
 * SRS §3.7.1 — Generate in under 5 seconds.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database }       from "@/types/database.types";
import type { MonthlyReport, WeeklyBreakdown, SitioBreakdown } from "@/types/app.types";
import { getMonthRange } from "@/lib/utils/date";

type DB = SupabaseClient<Database>;

export async function getMonthlyReport(
  supabase: DB,
  year:  number,
  month: number   // 1-indexed
): Promise<MonthlyReport> {
  const { start, end } = getMonthRange(year, month - 1);

  // Parallel: operations + incidents for the month
  const [opsResult, incResult, sitioOpsResult] = await Promise.all([
    supabase
      .from("daily_operations")
      .select("operation_date, status, fuel_consumed_l, waste_volume_kg")
      .gte("operation_date", start)
      .lte("operation_date", end),

    supabase
      .from("incidents")
      .select("id")
      .gte("incident_date", start)
      .lte("incident_date", end),

    supabase
      .from("daily_operations")
      .select("sitio_id, status, waste_volume_kg, sitios(name)")
      .gte("operation_date", start)
      .lte("operation_date", end),
  ]);

  const ops      = opsResult.data      ?? [];
  const sitioOps = sitioOpsResult.data ?? [];

  // ── Top-level stats ───────────────────────────────────────────────────────
  const total     = ops.length;
  const completed = ops.filter((o) => o.status === "Completed").length;
  const delayed   = ops.filter((o) => o.status === "Delayed").length;
  const missed    = ops.filter((o) => o.status === "Missed").length;

  // ── Weekly breakdown ──────────────────────────────────────────────────────
  const weekMap = new Map<string, { completed: number; delayed: number; missed: number; total: number }>();
  for (const op of ops) {
    const d    = new Date(op.operation_date + "T00:00");
    // Week key = Monday of that week
    const dow  = d.getDay();                              // 0=Sun
    const diff = dow === 0 ? -6 : 1 - dow;               // shift to Monday
    const mon  = new Date(d);
    mon.setDate(d.getDate() + diff);
    const key  = mon.toISOString().split("T")[0]!;

    const entry = weekMap.get(key) ?? { completed: 0, delayed: 0, missed: 0, total: 0 };
    entry.total++;
    if (op.status === "Completed") entry.completed++;
    else if (op.status === "Delayed")   entry.delayed++;
    else if (op.status === "Missed")    entry.missed++;
    weekMap.set(key, entry);
  }

  const byWeek: WeeklyBreakdown[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, e]) => ({
      weekStart,
      completed:      e.completed,
      delayed:        e.delayed,
      missed:         e.missed,
      completionRate: e.total > 0 ? Math.round((e.completed / e.total) * 100) : 0,
    }));

  // ── By-sitio breakdown ────────────────────────────────────────────────────
  const sitioMap = new Map<string, {
    name: string; completed: number; delayed: number; missed: number; total: number; wasteKg: number;
  }>();

  for (const op of sitioOps) {
    const sitioName = (op.sitios as { name: string } | null)?.name ?? "Unknown";
    const entry = sitioMap.get(op.sitio_id) ?? {
      name: sitioName, completed: 0, delayed: 0, missed: 0, total: 0, wasteKg: 0,
    };
    entry.total++;
    entry.wasteKg += op.waste_volume_kg ?? 0;
    if (op.status === "Completed") entry.completed++;
    else if (op.status === "Delayed") entry.delayed++;
    else if (op.status === "Missed")  entry.missed++;
    sitioMap.set(op.sitio_id, entry);
  }

  const bySitio: SitioBreakdown[] = Array.from(sitioMap.entries())
    .map(([sitioId, e]) => ({
      sitioId,
      sitioName:      e.name,
      completed:      e.completed,
      delayed:        e.delayed,
      missed:         e.missed,
      completionRate: e.total > 0 ? Math.round((e.completed / e.total) * 100) : 0,
      wasteKg:        e.wasteKg,
    }))
    .sort((a, b) => b.completionRate - a.completionRate);

  return {
    month:          `${year}-${String(month).padStart(2, "0")}`,
    totalRoutes:    total,
    completed,
    delayed,
    missed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalWasteKg:   ops.reduce((s, o) => s + (o.waste_volume_kg ?? 0), 0),
    totalFuelL:     ops.reduce((s, o) => s + (o.fuel_consumed_l  ?? 0), 0),
    incidentCount:  incResult.data?.length ?? 0,
    byWeek,
    bySitio,
  };
}

// Available months with data (for the month-picker dropdown)
export async function getAvailableMonths(supabase: DB): Promise<string[]> {
  const { data } = await supabase
    .from("daily_operations")
    .select("operation_date")
    .order("operation_date", { ascending: false })
    .limit(400);

  if (!data) return [];

  const months = new Set(data.map((r) => r.operation_date.slice(0, 7)));
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}