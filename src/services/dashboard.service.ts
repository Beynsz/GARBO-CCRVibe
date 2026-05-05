/**
 * GARBO — Dashboard Service
 * Server-side data fetching for the Home dashboard.
 * SDD §4.1.2 — Data Dashboard Grid: real-time KPI cards + operational overview.
 * SRS §3.4.1 — Dashboard must load in under 2 seconds.
 *
 * All functions accept a Supabase server client so they can be called from
 * Server Components without creating a new client on each call.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { DashboardKPIs, RecentActivity } from "@/types/app.types";
import { todayISO, currentMonthRange, daysAgoISO } from "@/lib/utils/date";

type DB = SupabaseClient<Database>;

// ─────────────────────────────────────────────────────────────────────────────
// KPI aggregation
// Runs parallel queries with Promise.all to stay under 2s budget.
// ─────────────────────────────────────────────────────────────────────────────
export async function getDashboardKPIs(supabase: DB): Promise<DashboardKPIs> {
  const today = todayISO();
  const { start: monthStart, end: monthEnd } = currentMonthRange();

  const [
    todayOpsResult,
    monthOpsResult,
    openIncidentsResult,
    announcementsResult,
    sitiosResult,
  ] = await Promise.all([
    // Today's operations
    supabase
      .from("daily_operations")
      .select("status")
      .eq("operation_date", today),

    // This month's resource totals
    supabase
      .from("daily_operations")
      .select("status, fuel_consumed_l, waste_volume_kg")
      .gte("operation_date", monthStart)
      .lte("operation_date", monthEnd),

    // Open incidents (last 7 days)
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .gte("incident_date", daysAgoISO(7)),

    // Active announcements
    supabase
      .from("announcements")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

    // Active sitios deployed
    supabase
      .from("master_schedules")
      .select("sitio_id", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  // ── Today's stats ────────────────────────────────────────────────────────
  const todayOps   = todayOpsResult.data ?? [];
  const pending    = todayOps.filter((o) => o.status === "Pending").length;
  const completed  = todayOps.filter((o) => o.status === "Completed").length;
  const delayed    = todayOps.filter((o) => o.status === "Delayed").length;
  const missed     = todayOps.filter((o) => o.status === "Missed").length;
  const total      = todayOps.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // ── Month-to-date resource totals ────────────────────────────────────────
  const monthOps = monthOpsResult.data ?? [];
  const totalWasteKg = monthOps.reduce(
    (sum, o) => sum + (o.waste_volume_kg ?? 0), 0
  );
  const totalFuelL = monthOps.reduce(
    (sum, o) => sum + (o.fuel_consumed_l ?? 0), 0
  );

  return {
    pendingRoutes:       pending,
    completedToday:      completed,
    delayedToday:        delayed,
    missedToday:         missed,
    completionRate,
    totalWasteKg,
    totalFuelL,
    openIncidents:       openIncidentsResult.count    ?? 0,
    activeAnnouncements: announcementsResult.count    ?? 0,
    sitiosDeployed:      sitiosResult.count           ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent activity feed (last 10 events across operations + incidents + announcements)
// ─────────────────────────────────────────────────────────────────────────────
export async function getRecentActivity(
  supabase: DB,
  limit = 8
): Promise<RecentActivity[]> {
  const since = daysAgoISO(3);

  const [opsResult, incidentsResult, announcementsResult] = await Promise.all([
    supabase
      .from("daily_operations")
      .select("id, status, operation_date, sitios(name), updated_at")
      .gte("operation_date", since)
      .in("status", ["Completed", "Delayed", "Missed"])
      .order("updated_at", { ascending: false })
      .limit(limit),

    supabase
      .from("incidents")
      .select("id, incident_type, reason_tag, created_at, sitios(name)")
      .gte("incident_date", since)
      .order("created_at", { ascending: false })
      .limit(4),

    supabase
      .from("announcements")
      .select("id, title, type, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const activities: RecentActivity[] = [];

  // Operations
  for (const op of opsResult.data ?? []) {
    const sitioName =
      (op.sitios as { name: string } | null)?.name ?? "Unknown Sitio";
    activities.push({
      id:          op.id,
      type:        "operation",
      description: `${sitioName} — route marked as ${op.status}`,
      timestamp:   op.updated_at ?? op.operation_date,
      status:      op.status as import("@/types/app.types").OperationStatus,
    });
  }

  // Incidents
  for (const inc of incidentsResult.data ?? []) {
    const sitioName =
      (inc.sitios as { name: string } | null)?.name ?? "Unknown Sitio";
    activities.push({
      id:          inc.id,
      type:        "incident",
      description: `${inc.incident_type} reported at ${sitioName} — ${inc.reason_tag}`,
      timestamp:   inc.created_at,
    });
  }

  // Announcements
  for (const ann of announcementsResult.data ?? []) {
    activities.push({
      id:          ann.id,
      type:        "announcement",
      description: `Announcement posted: "${ann.title}"`,
      timestamp:   ann.created_at,
    });
  }

  // Sort all activities by timestamp descending, take top N
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7-day completion trend (for the mini sparkline chart on the dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export interface DailyTrend {
  date:           string;  // "YYYY-MM-DD"
  completionRate: number;  // 0–100
  completed:      number;
  total:          number;
}

export async function getWeeklyTrend(supabase: DB): Promise<DailyTrend[]> {
  const since = daysAgoISO(6);

  const { data } = await supabase
    .from("daily_operations")
    .select("operation_date, status")
    .gte("operation_date", since)
    .order("operation_date", { ascending: true });

  if (!data || data.length === 0) return [];

  // Group by date
  const grouped = new Map<string, { completed: number; total: number }>();

  for (const row of data) {
    const entry = grouped.get(row.operation_date) ?? { completed: 0, total: 0 };
    entry.total++;
    if (row.status === "Completed") entry.completed++;
    grouped.set(row.operation_date, entry);
  }

  return Array.from(grouped.entries()).map(([date, { completed, total }]) => ({
    date,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    completed,
    total,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Today's scheduled routes (for the quick status overview table)
// ─────────────────────────────────────────────────────────────────────────────
export interface TodayRoute {
  operationId:  string;
  scheduleId:   string;
  routeName:    string;
  sitioName:    string;
  status:       import("@/types/app.types").OperationStatus;
  fuelL:        number | null;
  wasteKg:      number | null;
}

export async function getTodayRoutes(supabase: DB): Promise<TodayRoute[]> {
  const today = todayISO();

  const { data } = await supabase
    .from("daily_operations")
    .select(`
      id,
      schedule_id,
      status,
      fuel_consumed_l,
      waste_volume_kg,
      sitios ( name ),
      master_schedules ( route_name )
    `)
    .eq("operation_date", today)
    .order("status", { ascending: true });

  return (data ?? []).map((row) => ({
    operationId: row.id,
    scheduleId:  row.schedule_id,
    routeName:
      (row.master_schedules as { route_name: string } | null)?.route_name ??
      "Unknown Route",
    sitioName:
      (row.sitios as { name: string } | null)?.name ?? "Unknown Sitio",
    status:  row.status as import("@/types/app.types").OperationStatus,
    fuelL:   row.fuel_consumed_l,
    wasteKg: row.waste_volume_kg,
  }));
}