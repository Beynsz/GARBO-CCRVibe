import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient }    from "../../../../../supabase/server";
import { generateDailyOperations }       from "@/services/operations.service";
import { todayISO }                      from "@/lib/utils/date";
import type { ApiResponse }              from "@/types/app.types";

/**
 * POST /api/operations/generate
 * Body: { date?: "YYYY-MM-DD" }  (defaults to today)
 *
 * Calls the Supabase RPC generate_daily_operations() to create Pending
 * operations from the master schedule for the given date.
 * SRS §3.4.3.1 — also callable manually by admins for backfill.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let targetDate = todayISO();
  try {
    const body = await request.json();
    if (body?.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      targetDate = body.date as string;
    }
  } catch {
    // No body or invalid JSON — use today
  }

  const { createdCount, error } = await generateDailyOperations(supabase, targetDate);

  if (error) {
    return NextResponse.json(
      { success: false, error },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `${createdCount} operation${createdCount !== 1 ? "s" : ""} generated for ${targetDate}.`,
    data:    { createdCount, date: targetDate },
  });
}