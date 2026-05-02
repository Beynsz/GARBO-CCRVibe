import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createSupabaseServerClientReadOnly } from "../../../../supabase/server";
import {
  getDashboardKPIs,
  getWeeklyTrend,
  getTodayRoutes,
  getRecentActivity,
} from "@/services/dashboard.service";
import { DashboardGrid } from "@/components/organisms/DashboardGrid";
import { WeeklyTrendChart, WeeklyTrendChartSkeleton } from "@/components/organisms/WeeklyTrendChart";
import { TodayRoutesTable } from "@/components/organisms/TodayRoutesTable";
import { RecentActivityFeed } from "@/components/organisms/RecentActivityFeed";
import { Button } from "@/components/atoms/Button";
import { formatDateWithDay, todayISO } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Home" };

// Revalidate every 60s — keeps data fresh without a full SSR hit every request
export const revalidate = 60;

// ─────────────────────────────────────────────────────────────────────────────
// Home Page — Server Component
// All data fetching runs in parallel via Promise.all, targeting < 2s (SRS §3.7).
// ─────────────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const supabase = await createSupabaseServerClientReadOnly();

  const [kpis, trend, todayRoutes, activity, { data: { user } }] =
    await Promise.all([
      getDashboardKPIs(supabase),
      getWeeklyTrend(supabase),
      getTodayRoutes(supabase),
      getRecentActivity(supabase, 8),
      supabase.auth.getUser(),
    ]);

  const adminName = user?.email?.split("@")[0]?.split(".")?.[0] ?? "Admin";
  const greeting  = getGreeting();
  const dateLabel = formatDateWithDay(todayISO());

  return (
    <div className="animate-fade-in max-w-[1360px]">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="page-header mb-0">
          <h2 className="page-header__title">
            {greeting}{" "}
            <span className="text-[var(--color-primary)] capitalize">{adminName}</span>
          </h2>
          <p className="page-header__subtitle mt-1">
            {dateLabel} ·{" "}
            {kpis.pendingRoutes > 0
              ? `${kpis.pendingRoutes} route${kpis.pendingRoutes !== 1 ? "s" : ""} still pending`
              : "All routes accounted for today 🎉"}
          </p>
        </div>

        {/* Quick-action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/announcements/new">
            <Button variant="outline" size="sm">
              + Announcement
            </Button>
          </Link>
          <Link href="/schedule">
            <Button variant="primary" size="sm">
              View Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Missed-routes alert banner ───────────────────────────────── */}
      {kpis.missedToday > 0 && (
        <div className="alert-bar alert-bar--danger mb-6 animate-fade-in" role="alert">
          <span className="text-base leading-none" aria-hidden="true">⚠</span>
          <span className="text-sm">
            <strong>
              {kpis.missedToday} route{kpis.missedToday !== 1 ? "s" : ""} missed today.
            </strong>{" "}
            <Link href="/alerts" className="underline underline-offset-2 font-medium">
              View alerts →
            </Link>
          </span>
        </div>
      )}

      {/* ── KPI Grid ─────────────────────────────────────────────────── */}
      <section aria-labelledby="kpi-heading" className="mb-8">
        <h3
          id="kpi-heading"
          className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3"
        >
          Today&apos;s Overview
        </h3>
        <DashboardGrid kpis={kpis} />
      </section>

      {/* ── Chart + Activity row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

        {/* 7-day completion trend — spans 2 of 3 columns */}
        <section
          className="xl:col-span-2 card p-5"
          aria-labelledby="trend-heading"
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              id="trend-heading"
              className="text-sm font-semibold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              7-Day Completion Trend
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">Completion rate %</span>
          </div>
          <Suspense fallback={<WeeklyTrendChartSkeleton />}>
            <WeeklyTrendChart data={trend} />
          </Suspense>
        </section>

        {/* Recent activity */}
        <section
          className="card p-5 flex flex-col overflow-hidden"
          aria-labelledby="activity-heading"
        >
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3
              id="activity-heading"
              className="text-sm font-semibold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Recent Activity
            </h3>
            <Link
              href="/logbook"
              className="text-xs text-[var(--color-primary)] hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <RecentActivityFeed activities={activity} />
        </section>
      </div>

      {/* ── Today's Routes Table ─────────────────────────────────────── */}
      <section aria-labelledby="routes-heading">
        <div className="flex items-center justify-between mb-3">
          <h3
            id="routes-heading"
            className="text-sm font-semibold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Today&apos;s Collection Routes
          </h3>
          <div className="flex items-center gap-4">
            {/* Status legend */}
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
              {(["Completed", "Delayed", "Missed"] as const).map((s) => (
                <span key={s} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: `var(--status-${s.toLowerCase()})` }}
                  />
                  {s}
                </span>
              ))}
            </div>
            <Link
              href="/schedule"
              className="text-xs text-[var(--color-primary)] hover:underline font-medium"
            >
              Full schedule →
            </Link>
          </div>
        </div>

        <TodayRoutesTable routes={todayRoutes} />
      </section>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Greeting helper
// ─────────────────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}