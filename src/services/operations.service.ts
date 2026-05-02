/**
 * GARBO — Operations Service
 * Server-side data access for Daily Operations Tracking.
 * SRS §3.4.3 — Auto-generate daily task lists, mark status, input resource data.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database }       from "@/types/database.types";
import type { OperationWithDetails, OperationFilters, UpdateOperationData } from "@/types/app.types";
import { todayISO } from "@/lib/utils/date";

type DB = SupabaseClient<Database>;

// ─────────────────────────────────────────────────────────────────────────────
// List operations with full joins
// ─────────────────────────────────────────────────────────────────────────────
export async function getOperations(
  supabase: DB,
  filters: OperationFilters = { dateRange: { from: null, to: null }, sitioId: null, status: null }
): Promise<OperationWithDetails[]> {
  let query = supabase
    .from("daily_operations")
    .select(`
      *,
      sitio:sitios ( id, name ),
      schedule:master_schedules ( id, route_name, collection_days )
    `)
    .order("operation_date", { ascending: false })
    .order("updated_at",     { ascending: false, nullsFirst: true });

  // Date range
  if (filters.dateRange.from) query = query.gte("operation_date", filters.dateRange.from);
  if (filters.dateRange.to)   query = query.lte("operation_date", filters.dateRange.to);

  // Sitio
  if (filters.sitioId) query = query.eq("sitio_id", filters.sitioId);

  // Status
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.limit(200);

  if (error) {
    console.error("[getOperations]", error);
    return [];
  }

  return (data ?? []) as unknown as OperationWithDetails[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Get today's operations (optimised shortcut for dashboard + daily view)
// ─────────────────────────────────────────────────────────────────────────────
export async function getTodaysOperations(supabase: DB): Promise<OperationWithDetails[]> {
  return getOperations(supabase, {
    dateRange: { from: todayISO(), to: todayISO() },
    sitioId: null,
    status:  null,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Get single operation
// ─────────────────────────────────────────────────────────────────────────────
export async function getOperationById(
  supabase: DB,
  id: string
): Promise<OperationWithDetails | null> {
  const { data, error } = await supabase
    .from("daily_operations")
    .select(`
      *,
      sitio:sitios ( id, name ),
      schedule:master_schedules ( id, route_name, collection_days )
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as OperationWithDetails;
}

// ─────────────────────────────────────────────────────────────────────────────
// Update a single operation (status + resource data)
// SRS §3.4.3.2 — Mark route status.
// SRS §3.4.3.3 — Input resource data (fuel, waste volume).
// ─────────────────────────────────────────────────────────────────────────────
export async function updateOperation(
  supabase: DB,
  id: string,
  payload: UpdateOperationData,
  updatedBy: string
): Promise<{ data: OperationWithDetails | null; error: string | null }> {
  const { data, error } = await supabase
    .from("daily_operations")
    .update({
      status:          payload.status,
      fuel_consumed_l: payload.fuel_consumed_l,
      waste_volume_kg: payload.waste_volume_kg,
      notes:           payload.notes,
      updated_by:      updatedBy,
      updated_at:      new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
      *,
      sitio:sitios ( id, name ),
      schedule:master_schedules ( id, route_name, collection_days )
    `)
    .single();

  if (error) {
    console.error("[updateOperation]", error);
    return { data: null, error: error.message };
  }

  return { data: data as unknown as OperationWithDetails, error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulk update status (e.g. mark all Pending as Missed at end of day)
// ─────────────────────────────────────────────────────────────────────────────
export async function bulkUpdateStatus(
  supabase: DB,
  ids: string[],
  status: import("@/types/app.types").OperationStatus,
  updatedBy: string
): Promise<{ updatedCount: number; error: string | null }> {
  if (ids.length === 0) return { updatedCount: 0, error: null };

  const { data, error } = await supabase
    .from("daily_operations")
    .update({
      status,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .select("id");

  if (error) {
    console.error("[bulkUpdateStatus]", error);
    return { updatedCount: 0, error: error.message };
  }

  return { updatedCount: data?.length ?? 0, error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily summary stats (used by Operations page header)
// ─────────────────────────────────────────────────────────────────────────────
export interface OperationsDaySummary {
  date:           string;
  total:          number;
  completed:      number;
  delayed:        number;
  missed:         number;
  pending:        number;
  completionRate: number;
  totalWasteKg:   number;
  totalFuelL:     number;
}

export async function getOperationsSummary(
  supabase: DB,
  date: string
): Promise<OperationsDaySummary> {
  const { data, error } = await supabase
    .from("daily_operations")
    .select("status, fuel_consumed_l, waste_volume_kg")
    .eq("operation_date", date);

  if (error || !data) {
    return {
      date, total: 0, completed: 0, delayed: 0,
      missed: 0, pending: 0, completionRate: 0,
      totalWasteKg: 0, totalFuelL: 0,
    };
  }

  const completed = data.filter((r) => r.status === "Completed").length;
  const delayed   = data.filter((r) => r.status === "Delayed").length;
  const missed    = data.filter((r) => r.status === "Missed").length;
  const pending   = data.filter((r) => r.status === "Pending").length;
  const total     = data.length;

  return {
    date,
    total,
    completed,
    delayed,
    missed,
    pending,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalWasteKg:   data.reduce((s, r) => s + (r.waste_volume_kg ?? 0), 0),
    totalFuelL:     data.reduce((s, r) => s + (r.fuel_consumed_l  ?? 0), 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Manually trigger daily-ops generation for a given date
// (calls the Supabase Edge Function / RPC)
// SRS §3.4.3.1 — Auto-generate daily task lists at 00:00
// ─────────────────────────────────────────────────────────────────────────────
export async function generateDailyOperations(
  supabase: DB,
  targetDate: string
): Promise<{ createdCount: number; error: string | null }> {
  const { data, error } = await supabase
    .rpc("generate_daily_operations", { target_date: targetDate });

  if (error) {
    console.error("[generateDailyOperations]", error);
    return { createdCount: 0, error: error.message };
  }

  return { createdCount: (data as { created_count: number })?.created_count ?? 0, error: null };
}