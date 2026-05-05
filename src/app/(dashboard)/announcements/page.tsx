import type { Metadata } from "next";
import { createSupabaseServerClientReadOnly } from "../../../../supabase/server";
import { getAnnouncements } from "@/services/announcements.service";
import { AnnouncementsClient } from "./AnnouncementsClient";

export const metadata: Metadata = { title: "Announcements" };
export const revalidate = 30;

export default async function AnnouncementsPage() {
  const supabase      = await createSupabaseServerClientReadOnly();
  const announcements = await getAnnouncements(supabase);
  return <AnnouncementsClient announcements={announcements} />;
}