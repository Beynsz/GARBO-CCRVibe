/**
 * GARBO — Announcements Service
 * SRS §3.4.5 — Generate schedule summaries, manage public notices.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, AnnouncementRow } from "@/types/database.types";
import type { AnnouncementFormData } from "@/types/app.types";

type DB = SupabaseClient<Database>;

// ─────────────────────────────────────────────────────────────────────────────
// List
// ─────────────────────────────────────────────────────────────────────────────
export async function getAnnouncements(
  supabase: DB,
  activeOnly = false
): Promise<AnnouncementRow[]> {
  let query = supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query.limit(100);
  if (error) { console.error("[getAnnouncements]", error); return []; }
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────────────────────
export async function createAnnouncement(
  supabase: DB,
  payload: AnnouncementFormData,
  createdBy: string
): Promise<{ data: AnnouncementRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("announcements")
    .insert({ ...payload, created_by: createdBy })
    .select("*")
    .single();

  if (error) { console.error("[createAnnouncement]", error); return { data: null, error: error.message }; }
  return { data, error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────────────────────
export async function updateAnnouncement(
  supabase: DB,
  id: string,
  payload: Partial<AnnouncementFormData>
): Promise<{ data: AnnouncementRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("announcements")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) { console.error("[updateAnnouncement]", error); return { data: null, error: error.message }; }
  return { data, error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteAnnouncement(
  supabase: DB,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) { console.error("[deleteAnnouncement]", error); return { error: error.message }; }
  return { error: null };
}