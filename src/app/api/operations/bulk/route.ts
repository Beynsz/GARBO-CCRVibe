import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient }    from "../../../../../supabase/server";
import { bulkUpdateStatus }              from "@/services/operations.service";
import { z }                             from "zod";
import type { ApiResponse }              from "@/types/app.types";

const bulkSchema = z.object({
  ids:    z.array(z.string().uuid()).min(1, "At least one operation ID required").max(100),
  status: z.enum(["Pending", "Completed", "Delayed", "Missed"]),
});

/**
 * POST /api/operations/bulk
 * Body: { ids: string[], status: OperationStatus }
 * Updates all specified operations to the given status in a single query.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") },
      { status: 422 }
    );
  }

  const { ids, status } = parsed.data;
  const { updatedCount, error } = await bulkUpdateStatus(supabase, ids, status, user.id);

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `${updatedCount} operation${updatedCount !== 1 ? "s" : ""} updated to ${status}.`,
    data:    { updatedCount },
  });
}