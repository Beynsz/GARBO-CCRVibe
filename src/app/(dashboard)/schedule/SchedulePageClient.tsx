"use client";

/**
 * GARBO — SchedulePageClient
 * Client shell for the Schedule page.
 * Manages: active tab (Table | Calendar), calendar month navigation,
 * and the "New Schedule" button that opens the ScheduleForm modal.
 */

import { useState } from "react";
import { LayoutList, CalendarDays } from "lucide-react";
import { Button }           from "@/components/atoms/Button";
import { ScheduleTable }    from "@/components/organisms/ScheduleTable";
import { ScheduleCalendar } from "@/components/organisms/ScheduleCalendar";
import { ScheduleForm }     from "@/components/organisms/ScheduleForm";
import { cn } from "@/lib/utils/cn";
import type { ScheduleWithSitio } from "@/types/app.types";
import type { SitioRow }          from "@/types/database.types";
import { getSchedulesForMonth }   from "@/services/schedules.service";
import { createSupabaseServerClientReadOnly } from "../../../../supabase/server";

// Re-declare serialisable calendar shape (Maps can't cross RSC→Client boundary)
type CalendarData = Record<
  string,
  {
    id: string; route_name: string; is_active: boolean;
    frequency: string; collection_days: string[];
    sitio: { id: string; name: string };
  }[]
>;

type Tab = "table" | "calendar";

interface SchedulePageClientProps {
  schedules:           ScheduleWithSitio[];
  sitios:              SitioRow[];
  initialCalendarData: CalendarData;
  initialYear:         number;
  initialMonth:        number;
}

export function SchedulePageClient({
  schedules,
  sitios,
  initialCalendarData,
  initialYear,
  initialMonth,
}: SchedulePageClientProps) {
  const [activeTab,     setActiveTab    ] = useState<Tab>("table");
  const [showNewForm,   setShowNewForm  ] = useState(false);
  const [calendarData,  setCalendarData ] = useState<CalendarData>(initialCalendarData);
  const [calYear,       setCalYear      ] = useState(initialYear);
  const [calMonth,      setCalMonth     ] = useState(initialMonth);
  const [calLoading,    setCalLoading   ] = useState(false);

  // Reconstruct Map from the serialised object for ScheduleCalendar
  const calendarMap = new Map<string, ScheduleWithSitio[]>(
    Object.entries(calendarData).map(([k, v]) => [k, v as ScheduleWithSitio[]])
  );

  // ── Calendar month navigation — fetch new month data client-side ──────────
  async function handleMonthChange(year: number, month: number) {
    setCalYear(year);
    setCalMonth(month);
    setCalLoading(true);

    try {
      const res = await fetch(
        `/api/schedules/calendar?year=${year}&month=${month + 1}`
      );
      const json = await res.json();
      if (json.success) setCalendarData(json.data);
    } catch (e) {
      console.error("[SchedulePageClient] calendar fetch error:", e);
    } finally {
      setCalLoading(false);
    }
  }

  return (
    <div className="animate-fade-in max-w-[1360px]">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h2 className="page-header__title">Collection Schedule</h2>
          <p className="page-header__subtitle">
            {schedules.length} route{schedules.length !== 1 ? "s" : ""} ·{" "}
            {schedules.filter((s) => s.is_active).length} active
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowNewForm(true)}
          leftIcon={<span className="text-base leading-none">+</span>}
        >
          New Schedule
        </Button>
      </div>

      {/* ── Tab switcher ─────────────────────────────────────────────── */}
      <div
        className="inline-flex items-center gap-0.5 p-1 rounded-lg mb-6"
        style={{ background: "var(--color-bg-table-stripe)", border: "1px solid var(--color-border)" }}
        role="tablist"
      >
        {(
          [
            { id: "table",    label: "Table",    Icon: LayoutList   },
            { id: "calendar", label: "Calendar", Icon: CalendarDays },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
              activeTab === id
                ? "bg-[var(--color-bg-surface)] text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab panels ───────────────────────────────────────────────── */}
      <div role="tabpanel">
        {activeTab === "table" ? (
          <ScheduleTable schedules={schedules} sitios={sitios} />
        ) : (
          <div className={cn(calLoading && "opacity-60 pointer-events-none transition-opacity")}>
            <ScheduleCalendar
              scheduleMap={calendarMap}
              year={calYear}
              month={calMonth}
              onMonthChange={handleMonthChange}
            />
          </div>
        )}
      </div>

      {/* ── New schedule modal ───────────────────────────────────────── */}
      {showNewForm && (
        <ScheduleForm
          sitios={sitios}
          schedule={null}
          onClose={() => setShowNewForm(false)}
        />
      )}
    </div>
  );
}