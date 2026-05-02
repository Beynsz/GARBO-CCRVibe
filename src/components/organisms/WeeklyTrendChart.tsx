"use client";

/**
 * GARBO — Weekly Trend Chart
 * 7-day completion rate sparkline for the dashboard.
 * Uses Recharts (already in package.json).
 * SDD §4.1.5 — Reports & Analytics Section.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyTrend } from "@/services/dashboard.service";
import { parseISODate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

interface WeeklyTrendChartProps {
  data:       DailyTrend[];
  className?: string;
}

// Format "YYYY-MM-DD" → "Mon 14"
function formatChartDate(isoDate: string): string {
  const date = parseISODate(isoDate);
  return date.toLocaleDateString("en-PH", {
    weekday: "short",
    day:     "numeric",
  });
}

// Custom tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?:  boolean;
  payload?: { value: number; payload: DailyTrend }[];
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      className={cn(
        "px-3 py-2.5 rounded-lg text-xs shadow-md",
        "bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
      )}
    >
      <p className="font-semibold text-[var(--color-text-primary)] mb-1">
        {formatChartDate(data.date)}
      </p>
      <p className="text-[var(--color-success-text)]">
        Completion: <strong>{data.completionRate}%</strong>
      </p>
      <p className="text-[var(--color-text-muted)]">
        {data.completed} / {data.total} routes
      </p>
    </div>
  );
}

export function WeeklyTrendChart({ data, className }: WeeklyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-[180px] rounded-lg",
          "bg-[var(--color-bg-table-stripe)] border border-dashed border-[var(--color-border)]",
          "text-sm text-[var(--color-text-muted)]",
          className
        )}
      >
        No trend data available yet
      </div>
    );
  }

  // Recharts needs plain JS objects — map to chartable shape
  const chartData = data.map((d) => ({
    ...d,
    label: formatChartDate(d.date),
  }));

  return (
    <div className={cn("w-full h-[180px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
        >
          <defs>
            <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor="#626F47" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#626F47" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />

          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Area
            type="monotone"
            dataKey="completionRate"
            stroke="#626F47"
            strokeWidth={2.5}
            fill="url(#completionGradient)"
            dot={{
              r:           4,
              fill:        "#626F47",
              strokeWidth: 2,
              stroke:      "#FDFAF4",
            }}
            activeDot={{
              r:           6,
              fill:        "#626F47",
              stroke:      "#FDFAF4",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export function WeeklyTrendChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full h-[180px] rounded-lg animate-pulse",
        "bg-[var(--color-bg-table-stripe)]",
        className
      )}
    />
  );
}