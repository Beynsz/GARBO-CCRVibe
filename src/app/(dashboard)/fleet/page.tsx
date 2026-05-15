/**
 * GARBO — Fleet Management Page
 * Replaces the Logbook page in the admin dashboard.
 * Shows active vehicles, fuel efficiency, live fleet registry,
 * map placeholder, operations ticker, and capacity utilization.
 * SDD §4.1 — Admin Dashboard Fleet View (matches design Image 4)
 */

import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FleetClient } from "./FleetClient";

export const metadata: Metadata = {
  title: "Fleet Management — GARBO",
  description: "Live fleet tracking, vehicle status, and operations ticker.",
};

export const revalidate = 0;

export default async function FleetPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch operations as fleet trip data (last 30 days)
  const [
    { data: operations },
    { data: incidents },
    { data: sitios },
  ] = await Promise.all([
    supabase
      .from("operations")
      .select(`*, sitio:sitios(id, name)`)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("sitios").select("*").order("name"),
  ]);

  return (
    <FleetClient
      operations={operations ?? []}
      incidents={incidents ?? []}
      sitios={sitios ?? []}
    />
  );
}