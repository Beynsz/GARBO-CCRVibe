import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../supabase/server";
import { todayISO } from "@/lib/utils/date";
import type { ApiResponse } from "@/types/app.types";

/**
 * GET /api/operations
 * Returns daily operations with optional filters:
 *   ?date=YYYY-MM-DD  (default: today)
 *   ?from=YYYY-MM-DD&to=YYYY-MM-DD
 *   ?sitioId=uuid
 *   ?status=Pending|Completed|Delayed|Missed
 *   ?page=1&pageSize=20
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const sp      = request.nextUrl.searchParams;
  const date    = sp.get("date");
  const from    = sp.get("from");
  const to      = sp.get("to");
  const sitioId = sp.get("sitioId");
  const status  = sp.get("status");
  const page    = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const size    = Math.min(100, parseInt(sp.get("pageSize") ?? "20", 10));

  let query = supabase
    .from("daily_operations")
    .select(
      `*, sitios(id, name), master_schedules(id, route_name, collection_days)`,
      { count: "exact" }
    );

  // Apply filters
  if (date)    query = query.eq("operation_date", date);
  else if (from || to) {
    if (from)  query = query.gte("operation_date", from);
    if (to)    query = query.lte("operation_date", to);
  } else {
    // Default: today
    query = query.eq("operation_date", todayISO());
  }

  if (sitioId) query = query.eq("sitio_id", sitioId);
  if (status)  query = query.eq("status",   status);

  // Pagination
  const offset = (page - 1) * size;
  query = query
    .order("operation_date", { ascending: false })
    .order("updated_at",     { ascending: false, nullsFirst: true })
    .range(offset, offset + size - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[GET /api/operations]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch operations" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      data:       data ?? [],
      total:      count ?? 0,
      page,
      pageSize:   size,
      totalPages: Math.ceil((count ?? 0) / size),
    },
  });
}

/**
 * POST /api/operations
 * Manually creates a single daily operation record.
 * (Normally handled by the cron edge function, but useful for backfill.)
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

  // Minimal validation
  const { schedule_id, sitio_id, operation_date } = body as Record<string, string>;
  if (!schedule_id || !sitio_id || !operation_date) {
    return NextResponse.json(
      { success: false, error: "schedule_id, sitio_id, and operation_date are required" },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("daily_operations")
    .insert({ schedule_id, sitio_id, operation_date, status: "Pending" })
    .select("id, status, operation_date")
    .single();

  if (error) {
    console.error("[POST /api/operations]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create operation" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}