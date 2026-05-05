import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../supabase/server";
import { getSchedulesForMonth }        from "@/services/schedules.service";
import type { ApiResponse }            from "@/types/app.types";

/**
 * GET /api/schedules/calendar?year=2026&month=4
 * Returns a plain object map of ISO date → ScheduleWithSitio[]
 * Used by SchedulePageClient for client-side month navigation.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const sp    = request.nextUrl.searchParams;
  const year  = parseInt(sp.get("year")  ?? String(new Date().getFullYear()), 10);
  const month = parseInt(sp.get("month") ?? String(new Date().getMonth() + 1), 10) - 1; // convert to 0-indexed

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    return NextResponse.json(
      { success: false, error: "Invalid year or month" },
      { status: 400 }
    );
  }

  const map  = await getSchedulesForMonth(supabase, year, month);
  const data: Record<string, unknown> = {};
  map.forEach((v, k) => { data[k] = v; });

  return NextResponse.json({ success: true, data });
}