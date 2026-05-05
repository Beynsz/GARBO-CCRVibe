import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../supabase/server";
import { scheduleSchema } from "@/lib/validations/schedule.schema";
import { getSchedules, createSchedule } from "@/services/schedules.service";
import type { ApiResponse } from "@/types/app.types";

/**
 * GET /api/schedules
 * Query params: ?sitioId=uuid  ?isActive=true|false  ?day=Monday
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const sp       = request.nextUrl.searchParams;
  const sitioId  = sp.get("sitioId") ?? undefined;
  const isActive = sp.has("isActive") ? sp.get("isActive") === "true" : undefined;
  const day      = sp.get("day") ?? undefined;

  const data = await getSchedules(supabase, { sitioId, isActive, day });

  return NextResponse.json({ success: true, data }, { status: 200 });
}

/**
 * POST /api/schedules
 * Creates a new recurring collection route.
 * SRS §3.4.2.1
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error:   "Validation failed",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
      { status: 422 }
    );
  }

  const { data, error } = await createSchedule(supabase, {
    ...parsed.data,
    created_by: user.id,
  });

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: error ?? "Failed to create schedule" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, data, message: "Schedule created successfully." },
    { status: 201 }
  );
}