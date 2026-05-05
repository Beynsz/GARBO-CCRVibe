/**
 * GARBO — Schedules Service
 * Server-side data access for Master Schedule Management.
 * SRS §3.4.2 — Create, edit, delete recurring collection routes.
 * SRS §3.4.2.2 — Assign specific Sitios to routes.
 * SRS §3.4.2.3 — View schedule in monthly calendar format.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ScheduleWithSitio } from "@/types/app.types";
import type { SitioRow } from "@/types/database.types";

type DB = SupabaseClient<Database>;

// ─────────────────────────────────────────────────────────────────────────────
// Schedules — list
// ─────────────────────────────────────────────────────────────────────────────
export interface ScheduleFilters {
  sitioId?:  string | null;
  isActive?: boolean | null;
  day?:      string | null;   // e.g. "Monday"
}

export async function getSchedules(
  supabase: DB,
  filters: ScheduleFilters = {}
): Promise<ScheduleWithSitio[]> {
  let query = supabase
    .from("master_schedules")
    .select(`
      *,
      sitio:sitios ( id, name )
    `)
    .order("created_at", { ascending: false });

  if (filters.sitioId) query = query.eq("sitio_id", filters.sitioId);
  if (filters.isActive !== null && filters.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getSchedules]", error);
    return [];
  }

  let results = (data ?? []) as unknown as ScheduleWithSitio[];

  // Filter by day client-side (array contains)
  if (filters.day) {
    results = results.filter((s) =>
      s.collection_days.includes(filters.day!)
    );
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedules — single
// ─────────────────────────────────────────────────────────────────────────────
export async function getScheduleById(
  supabase: DB,
  id: string
): Promise<ScheduleWithSitio | null> {
  const { data, error } = await supabase
    .from("master_schedules")
    .select(`*, sitio:sitios ( id, name )`)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as ScheduleWithSitio;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedules — create
// ─────────────────────────────────────────────────────────────────────────────
export interface CreateSchedulePayload {
  sitio_id:        string;
  route_name:      string;
  collection_days: string[];
  frequency:       string;
  is_active:       boolean;
  created_by:      string;
}

export async function createSchedule(
  supabase: DB,
  payload: CreateSchedulePayload
): Promise<{ data: ScheduleWithSitio | null; error: string | null }> {
  const { data, error } = await supabase
    .from("master_schedules")
    .insert(payload)
    .select(`*, sitio:sitios ( id, name )`)
    .single();

  if (error) {
    console.error("[createSchedule]", error);
    return { data: null, error: error.message };
  }

  return { data: data as unknown as ScheduleWithSitio, error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedules — update
// ─────────────────────────────────────────────────────────────────────────────
export interface UpdateSchedulePayload {
  sitio_id?:        string;
  route_name?:      string;
  collection_days?: string[];
  frequency?:       string;
  is_active?:       boolean;
}

export async function updateSchedule(
  supabase: DB,
  id: string,
  payload: UpdateSchedulePayload
): Promise<{ data: ScheduleWithSitio | null; error: string | null }> {
  const { data, error } = await supabase
    .from("master_schedules")
    .update(payload)
    .eq("id", id)
    .select(`*, sitio:sitios ( id, name )`)
    .single();

  if (error) {
    console.error("[updateSchedule]", error);
    return { data: null, error: error.message };
  }

  return { data: data as unknown as ScheduleWithSitio, error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedules — delete (soft: set is_active = false)
// ─────────────────────────────────────────────────────────────────────────────
export async function deactivateSchedule(
  supabase: DB,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("master_schedules")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("[deactivateSchedule]", error);
    return { error: error.message };
  }
  return { error: null };
}

// Hard delete — only used by admins who explicitly confirm
export async function deleteSchedule(
  supabase: DB,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("master_schedules")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteSchedule]", error);
    return { error: error.message };
  }
  return { error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sitios — list (for dropdowns)
// ─────────────────────────────────────────────────────────────────────────────
export async function getSitios(supabase: DB): Promise<SitioRow[]> {
  const { data, error } = await supabase
    .from("sitios")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[getSitios]", error);
    return [];
  }
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar data — schedules that run on each day of a given month
// Returns a map: "YYYY-MM-DD" → ScheduleWithSitio[]
// ─────────────────────────────────────────────────────────────────────────────
export async function getSchedulesForMonth(
  supabase: DB,
  year: number,
  month: number   // 0-indexed (Jan = 0)
): Promise<Map<string, ScheduleWithSitio[]>> {
  // Fetch all active schedules
  const schedules = await getSchedules(supabase, { isActive: true });

  const map = new Map<string, ScheduleWithSitio[]>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date    = new Date(year, month, d);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }); // "Monday" etc.
    const isoKey  = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const daySchedules = schedules.filter((s) =>
      s.collection_days.includes(dayName)
    );

    if (daySchedules.length > 0) {
      map.set(isoKey, daySchedules);
    }
  }

  return map;
}