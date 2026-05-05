import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../supabase/server";
import { updateOperationSchema } from "@/lib/validations/operation.schema";
import type { ApiResponse } from "@/types/app.types";

/**
 * PATCH /api/operations/[id]
 * Updates status, fuel_consumed_l, waste_volume_kg, notes for a daily operation.
 * SRS §3.4.3 — Mark route status as Completed / Delayed / Missed.
 * SRS §3.5.1 — Only authenticated Admins may write (enforced by RLS + server auth check).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  // ── Auth guard ─────────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // ── Validate ───────────────────────────────────────────────────────────
  const parsed = updateOperationSchema.safeParse(body);
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

  const { id } = await params;
  const { status, fuel_consumed_l, waste_volume_kg, notes } = parsed.data;

  // ── Update ─────────────────────────────────────────────────────────────
  const updatePayload = {
    status,
    fuel_consumed_l: fuel_consumed_l ?? null,
    waste_volume_kg: waste_volume_kg ?? null,
    notes: notes ?? null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("daily_operations")
    .update(updatePayload)
    .eq("id", id)
    .select("id, status, updated_at")
    .single();

  if (error) {
    console.error("[PATCH /api/operations/:id]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update operation" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Daily operation updated successfully.",
      data,
    },
    { status: 200 }
  );
}

/**
 * GET /api/operations/[id]
 * Returns a single operation with related sitio + schedule data.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from("daily_operations")
    .select(`
      *,
      sitios ( id, name ),
      master_schedules ( id, route_name, collection_days )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: "Operation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data }, { status: 200 });
}