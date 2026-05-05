import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient }    from "../../../../supabase/server";
import { z }                             from "zod";
import { getAnnouncements, createAnnouncement } from "@/services/announcements.service";
import type { ApiResponse } from "@/types/app.types";

const announcementSchema = z.object({
  title:     z.string().min(1).max(160),
  body:      z.string().min(1).max(2000),
  type:      z.enum(["Weather Delay","Reminder","Notice","Cancellation","Other"]),
  is_active: z.boolean().default(true),
});

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const activeOnly = request.nextUrl.searchParams.get("active") === "true";
  const data = await getAnnouncements(supabase, activeOnly);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }

  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") },
      { status: 422 }
    );
  }

  const { data, error } = await createAnnouncement(supabase, parsed.data, user.id);
  if (error || !data) {
    return NextResponse.json({ success: false, error: error ?? "Failed to create" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data, message: "Announcement created." }, { status: 201 });
}