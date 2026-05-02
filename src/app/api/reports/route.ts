import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient }    from "../../../../supabase/server";
import { getMonthlyReport, getAvailableMonths } from "@/services/reports.service";
import type { ApiResponse } from "@/types/app.types";

/**
 * GET /api/reports?year=2026&month=4
 * Returns the full MonthlyReport JSON.
 * SRS §3.7.1 — Generate monthly summary reports in under 5 seconds.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const sp   = request.nextUrl.searchParams;
  const now  = new Date();
  const year  = parseInt(sp.get("year")  ?? String(now.getFullYear()), 10);
  const month = parseInt(sp.get("month") ?? String(now.getMonth() + 1), 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ success: false, error: "Invalid year or month" }, { status: 400 });
  }

  const [report, availableMonths] = await Promise.all([
    getMonthlyReport(supabase, year, month),
    getAvailableMonths(supabase),
  ]);

  return NextResponse.json({ success: true, data: { report, availableMonths } });
}