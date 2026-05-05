"use client";

/**
 * GARBO — ScheduleCalendar Organism
 * SRS §3.4.2.3 — View the Master Schedule in a monthly calendar format.
 * Displays which routes/sitios are scheduled on each day of the month.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ScheduleWithSitio } from "@/types/app.types";
import { buildCalendarGrid, formatMonthYear, toISODate, todayISO } from "@/lib/utils/date";

interface ScheduleCalendarProps {
  /** Map of ISO date → schedules for that day (from getSchedulesForMonth) */
  scheduleMap: Map<string, ScheduleWithSitio[]>;
  year:        number;
  month:       number;   // 0-indexed
  onMonthChange: (year: number, month: number) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Up to 2 pills per cell — remainder shown as "+N more"
const MAX_PILLS = 2;

export function ScheduleCalendar({
  scheduleMap,
  year,
  month,
  onMonthChange,
}: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today   = todayISO();
  const grid    = buildCalendarGrid(year, month);

  function prevMonth() {
    const d = new Date(year, month - 1, 1);
    onMonthChange(d.getFullYear(), d.getMonth());
  }
  function nextMonth() {
    const d = new Date(year, month + 1, 1);
    onMonthChange(d.getFullYear(), d.getMonth());
  }

  const selectedSchedules = selectedDate ? (scheduleMap.get(selectedDate) ?? []) : [];

  return (
    <div className="card overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
        <h3
          className="text-base font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {formatMonthYear(new Date(year, month, 1))}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]",
              "hover:bg-[var(--color-bg-table-stripe)] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
            )}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onMonthChange(new Date().getFullYear(), new Date().getMonth())}
            className="px-3 py-1 text-xs font-medium text-[var(--color-primary)] hover:underline transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]",
              "hover:bg-[var(--color-bg-table-stripe)] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
            )}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Day-of-week headers ─────────────────────────────────────── */}
      <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Date grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-7">
        {grid.map((date, i) => {
          const iso          = toISODate(date);
          const isThisMonth  = date.getMonth() === month;
          const isToday      = iso === today;
          const isSelected   = iso === selectedDate;
          const daySchedules = scheduleMap.get(iso) ?? [];
          const hasSched     = daySchedules.length > 0;
          const extra        = daySchedules.length - MAX_PILLS;

          return (
            <button
              key={iso + i}
              onClick={() => setSelectedDate(isSelected ? null : iso)}
              className={cn(
                "min-h-[72px] p-1.5 text-left border-b border-r border-[var(--color-border)]",
                "transition-colors duration-100 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)]",
                // Not current month
                !isThisMonth && "bg-[var(--color-bg-page)] opacity-40",
                // Today highlight
                isToday     && "bg-[var(--color-olive-50,#FAFDF2)]",
                // Selected
                isSelected  && "bg-[rgba(98,111,71,0.06)] ring-2 ring-inset ring-[var(--color-primary)]",
                // Hover
                isThisMonth && !isSelected && "hover:bg-[var(--color-bg-table-stripe)]"
              )}
              aria-label={`${iso}${hasSched ? `, ${daySchedules.length} route${daySchedules.length !== 1 ? "s" : ""}` : ""}`}
              aria-pressed={isSelected}
            >
              {/* Date number */}
              <span
                className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1",
                  isToday
                    ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)]"
                    : "text-[var(--color-text-primary)]"
                )}
              >
                {date.getDate()}
              </span>

              {/* Route pills */}
              <div className="space-y-0.5">
                {daySchedules.slice(0, MAX_PILLS).map((s) => (
                  <div
                    key={s.id}
                    className="truncate text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--color-primary)",
                      color:      "var(--color-text-on-primary)",
                    }}
                    title={`${s.sitio.name} — ${s.route_name}`}
                  >
                    {s.sitio.name}
                  </div>
                ))}
                {extra > 0 && (
                  <div className="text-[9px] text-[var(--color-text-muted)] pl-1">
                    +{extra} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Day detail panel ───────────────────────────────────────── */}
      {selectedDate && (
        <div className="border-t border-[var(--color-border)] px-5 py-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4
              className="text-sm font-semibold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {new Date(selectedDate + "T00:00").toLocaleDateString("en-PH", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              Clear
            </button>
          </div>

          {selectedSchedules.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No collection routes scheduled.</p>
          ) : (
            <ul className="space-y-2">
              {selectedSchedules.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: "var(--color-bg-table-stripe)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: "var(--color-primary)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {s.route_name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {s.sitio.name} · {s.frequency}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: s.is_active ? "var(--color-success-bg)" : "var(--color-danger-bg)",
                      color:      s.is_active ? "var(--color-success-text)" : "var(--color-danger-text)",
                    }}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}