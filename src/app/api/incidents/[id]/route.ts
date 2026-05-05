import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../supabase/server";
import { deleteIncident }             from "@/services/incidents.service";
import type { ApiResponse }           from "@/types/app.types";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await deleteIncident(supabase, id);
  if (error) return NextResponse.json({ success: false, error }, { status: 500 });

  return NextResponse.json({ success: true, message: "Incident deleted." });
}