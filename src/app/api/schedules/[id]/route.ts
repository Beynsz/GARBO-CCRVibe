import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../supabase/server";
import { scheduleSchema } from "@/lib/validations/schedule.schema";
import {
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  deactivateSchedule,
} from "@/services/schedules.service";
import type { ApiResponse } from "@/types/app.types";

type RouteContext = { params: Promise<{ id: string }> };

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/schedules/[id]
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await getScheduleById(supabase, id);

  if (!data) {
    return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/schedules/[id]
// Partial update — accepts same shape as POST but all fields optional.
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  // Partial — use .partial() so not all fields are required on update
  const parsed = scheduleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") },
      { status: 422 }
    );
  }

  const { id } = await params;
  const { data, error } = await updateSchedule(supabase, id, parsed.data);

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: error ?? "Update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data, message: "Schedule updated." });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/schedules/[id]
// ?hard=true → permanent delete; default → soft deactivate
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id }  = await params;
  const isHard  = request.nextUrl.searchParams.get("hard") === "true";

  const { error } = isHard
    ? await deleteSchedule(supabase, id)
    : await deactivateSchedule(supabase, id);

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: isHard ? "Schedule permanently deleted." : "Schedule deactivated.",
  });
}