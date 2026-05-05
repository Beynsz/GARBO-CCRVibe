import type { Metadata } from "next";
import { createSupabaseServerClientReadOnly } from "../../../../supabase/server";
import { getMonthlyReport, getAvailableMonths } from "@/services/reports.service";
import { ReportsClient } from "./ReportsClient";

export const metadata: Metadata = { title: "Reports" };
export const revalidate = 120;

export default async function ReportsPage() {
  const supabase = await createSupabaseServerClientReadOnly();
  const now      = new Date();
  const year     = now.getFullYear();
  const month    = now.getMonth() + 1;

  const [report, availableMonths] = await Promise.all([
    getMonthlyReport(supabase, year, month),
    getAvailableMonths(supabase),
  ]);

  // Ensure current month is in the list even if no data yet
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const months   = availableMonths.includes(monthKey)
    ? availableMonths
    : [monthKey, ...availableMonths];

  return (
    <ReportsClient
      initialReport={report}
      availableMonths={months}
      initialMonth={monthKey}
    />
  );
}