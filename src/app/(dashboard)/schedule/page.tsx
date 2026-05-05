import type { Metadata } from "next";
import { createSupabaseServerClientReadOnly } from "../../../../supabase/server";
import { getSchedules, getSitios, getSchedulesForMonth } from "@/services/schedules.service";
import { SchedulePageClient } from "./SchedulePageClient";

export const metadata: Metadata = { title: "Schedule" };
export const revalidate = 60;

// ─────────────────────────────────────────────────────────────────────────────
// Schedule Page — Server Component
// Fetches all schedules + sitios for the table, and builds the calendar map
// for the current month, both in parallel.
// ─────────────────────────────────────────────────────────────────────────────
export default async function SchedulePage() {
  const supabase = await createSupabaseServerClientReadOnly();
  const now      = new Date();
  const year     = now.getFullYear();
  const month    = now.getMonth();

  const [schedules, sitios, calendarMap] = await Promise.all([
    getSchedules(supabase),
    getSitios(supabase),
    getSchedulesForMonth(supabase, year, month),
  ]);

  // Serialise the Map to a plain object for the client component
  const calendarData: Record<string, { id: string; route_name: string; sitio: { id: string; name: string }; is_active: boolean; frequency: string; collection_days: string[] }[]> = {};
  calendarMap.forEach((v, k) => { calendarData[k] = v; });

  return (
    <SchedulePageClient
      schedules={schedules}
      sitios={sitios}
      initialCalendarData={calendarData}
      initialYear={year}
      initialMonth={month}
    />
  );
}