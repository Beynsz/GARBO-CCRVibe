import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../supabase/server";
import { incidentSchema }             from "@/lib/validations/incident.schema";
import { getIncidents, createIncident } from "@/services/incidents.service";
import type { ApiResponse, IncidentFilters } from "@/types/app.types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const sp   = request.nextUrl.searchParams;
  const filters: IncidentFilters = {
    dateRange:    { from: sp.get("from"), to: sp.get("to") },
    sitioId:      sp.get("sitioId"),
    incidentType: sp.get("type") as IncidentFilters["incidentType"],
  };

  const data = await getIncidents(supabase, filters);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  const parsed = incidentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") },
      { status: 422 }
    );
  }

  const { data, error } = await createIncident(supabase, {
    ...parsed.data,
    operation_id:         parsed.data.operation_id ?? null,
    location_description: parsed.data.location_description ?? null,
    logged_by:            user.id,
  });

  if (error || !data) {
    return NextResponse.json({ success: false, error: error ?? "Failed to log incident" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data, message: "Incident logged successfully." }, { status: 201 });
}