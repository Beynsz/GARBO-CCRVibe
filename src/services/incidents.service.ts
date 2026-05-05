/**
 * GARBO — Incidents Service
 * SRS §3.4.4 — Incident & Complaint Logging
 * Log missed collections, illegal dumping, filter by date/sitio.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database }       from "@/types/database.types";
import type { IncidentWithSitio, IncidentFilters } from "@/types/app.types";

type DB = SupabaseClient<Database>;

// ─────────────────────────────────────────────────────────────────────────────
// List incidents with joins
// ─────────────────────────────────────────────────────────────────────────────
export async function getIncidents(
  supabase: DB,
  filters: IncidentFilters = {
    dateRange:    { from: null, to: null },
    sitioId:      null,
    incidentType: null,
  }
): Promise<IncidentWithSitio[]> {
  let query = supabase
    .from("incidents")
    .select(`*, sitio:sitios ( id, name )`)
    .order("incident_date", { ascending: false })
    .order("created_at",    { ascending: false });

  if (filters.dateRange.from) query = query.gte("incident_date", filters.dateRange.from);
  if (filters.dateRange.to)   query = query.lte("incident_date", filters.dateRange.to);
  if (filters.sitioId)        query = query.eq("sitio_id",       filters.sitioId);
  if (filters.incidentType)   query = query.eq("incident_type",  filters.incidentType);

  const { data, error } = await query.limit(200);
  if (error) { console.error("[getIncidents]", error); return []; }
  return (data ?? []) as unknown as IncidentWithSitio[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Create incident
// ─────────────────────────────────────────────────────────────────────────────
export interface CreateIncidentPayload {
  sitio_id:             string;
  operation_id:         string | null;
  incident_type:        string;
  reason_tag:           string;
  location_description: string | null;
  incident_date:        string;
  logged_by:            string;
}

export async function createIncident(
  supabase: DB,
  payload: CreateIncidentPayload
): Promise<{ data: IncidentWithSitio | null; error: string | null }> {
  const { data, error } = await supabase
    .from("incidents")
    .insert(payload)
    .select(`*, sitio:sitios ( id, name )`)
    .single();

  if (error) { console.error("[createIncident]", error); return { data: null, error: error.message }; }
  return { data: data as unknown as IncidentWithSitio, error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete incident
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteIncident(
  supabase: DB,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("incidents").delete().eq("id", id);
  if (error) { console.error("[deleteIncident]", error); return { error: error.message }; }
  return { error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent open incidents count (for sidebar badge + dashboard KPI)
// ─────────────────────────────────────────────────────────────────────────────
export async function getOpenIncidentCount(
  supabase: DB,
  dayWindow = 7
): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - dayWindow);
  const { count } = await supabase
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .gte("incident_date", since.toISOString().split("T")[0]);
  return count ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Incident type breakdown (for reports)
// ─────────────────────────────────────────────────────────────────────────────
export interface IncidentTypeBreakdown {
  incident_type: string;
  count:         number;
}

export async function getIncidentTypeBreakdown(
  supabase: DB,
  from: string,
  to:   string
): Promise<IncidentTypeBreakdown[]> {
  const { data, error } = await supabase
    .from("incidents")
    .select("incident_type")
    .gte("incident_date", from)
    .lte("incident_date", to);

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.incident_type] = (counts[row.incident_type] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([incident_type, count]) => ({ incident_type, count }))
    .sort((a, b) => b.count - a.count);
}