"use client";

/**
 * GARBO — ReportsClient
 * Manages month switching: fetches fresh report JSON from /api/reports
 * then passes it to ReportsSection for rendering.
 */

import { useState }      from "react";
import { ReportsSection } from "@/components/organisms/ReportsSection";
import type { MonthlyReport } from "@/types/app.types";

interface ReportsClientProps {
  initialReport:   MonthlyReport;
  availableMonths: string[];
  initialMonth:    string;
}

export function ReportsClient({
  initialReport,
  availableMonths,
  initialMonth,
}: ReportsClientProps) {
  const [report,   setReport  ] = useState<MonthlyReport>(initialReport);
  const [month,    setMonth   ] = useState(initialMonth);
  const [loading,  setLoading ] = useState(false);

  async function handleMonthChange(newMonth: string) {
    if (newMonth === month) return;
    setMonth(newMonth);
    setLoading(true);

    try {
      const [year, mo] = newMonth.split("-");
      const res  = await fetch(`/api/reports?year=${year}&month=${parseInt(mo!, 10)}`);
      const json = await res.json();
      if (json.success) setReport(json.data.report);
    } catch (e) {
      console.error("[ReportsClient]", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in max-w-[1360px]">
      <div className="page-header mb-6">
        <h2 className="page-header__title">Reports</h2>
        <p className="page-header__subtitle">
          Monthly performance data · Export to CSV or PDF
        </p>
      </div>

      <ReportsSection
        report={report}
        availableMonths={availableMonths}
        selectedMonth={month}
        onMonthChange={handleMonthChange}
        isLoading={loading}
      />
    </div>
  );
}