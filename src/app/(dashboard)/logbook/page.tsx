import type { Metadata }   from "next";
import { createSupabaseServerClientReadOnly } from "../../../../supabase/server";
import { getOperations }   from "@/services/operations.service";
import { getSitios }       from "@/services/schedules.service";
import { LogbookClient }   from "./LogbookClient";
import { daysAgoISO, todayISO } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Logbook" };
export const revalidate = 30;

export default async function LogbookPage() {
  const supabase = await createSupabaseServerClientReadOnly();

  // Default: show last 30 days
  const [operations, sitios] = await Promise.all([
    getOperations(supabase, {
      dateRange: { from: daysAgoISO(30), to: todayISO() },
      sitioId: null,
      status:  null,
    }),
    getSitios(supabase),
  ]);

  return <LogbookClient operations={operations} sitios={sitios} />;
}