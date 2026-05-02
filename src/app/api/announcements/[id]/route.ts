import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient }    from "../../../../../supabase/server";
import { z }                             from "zod";
import { updateAnnouncement, deleteAnnouncement } from "@/services/announcements.service";
import type { ApiResponse } from "@/types/app.types";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title:     z.string().min(1).max(160).optional(),
  body:      z.string().min(1).max(2000).optional(),
  type:      z.enum(["Weather Delay","Reminder","Notice","Cancellation","Other"]).optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") },
      { status: 422 }
    );
  }

  const { id } = await params;
  const { data, error } = await updateAnnouncement(supabase, id, parsed.data);
  if (error || !data) return NextResponse.json({ success: false, error: error ?? "Update failed" }, { status: 500 });

  return NextResponse.json({ success: true, data, message: "Announcement updated." });
}

export async function DELETE(_req: NextRequest, { params }: Ctx): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await deleteAnnouncement(supabase, id);
  if (error) return NextResponse.json({ success: false, error }, { status: 500 });

  return NextResponse.json({ success: true, message: "Announcement deleted." });
}