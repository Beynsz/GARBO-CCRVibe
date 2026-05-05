"use client";

/**
 * GARBO — DashboardGrid Organism
 * SDD §4.1.2 — Data Dashboard Grid
 * Displays KPI cards for today's operations: pending, completed, missed, etc.
 * Matches Image 3: 3-column coloured card grid.
 */

import { KpiCard, KpiCardSkeleton } from "@/components/molecules/KpiCard";
import type { DashboardKPIs } from "@/types/app.types";

interface DashboardGridProps {
  kpis:       DashboardKPIs;
  isLoading?: boolean;
}

export function DashboardGrid({ kpis, isLoading = false }: DashboardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Row 1 — Today's operational status */}
      <KpiCard
        label="Schedulable"
        value={kpis.pendingRoutes + kpis.completedToday + kpis.delayedToday + kpis.missedToday}
        subText="Total routes today"
        icon="schedule"
        variant="default"
      />
      <KpiCard
        label="Unique"
        value={kpis.sitiosDeployed}
        subText="Active sitios"
        icon="map-pin"
        variant="default"
      />
      <KpiCard
        label="Recommended"
        value={`${kpis.completionRate}%`}
        subText="Today's completion rate"
        icon="check-circle"
        variant={
          kpis.completionRate >= 80
            ? "success"
            : kpis.completionRate >= 50
            ? "warning"
            : "danger"
        }
      />

      {/* Row 2 — Sustainability stats */}
      <KpiCard
        label="Sustainability Index"
        value={`${kpis.completionRate}%`}
        subText="↑ Recycling Rate"
        icon="refresh"
        variant="success"
      />
      <KpiCard
        label="Organic Waste"
        value={`${kpis.totalWasteKg.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg`}
        subText="Month-to-date"
        icon="weight"
        variant="default"
      />
      <KpiCard
        label="Vehicles Deployed"
        value={kpis.sitiosDeployed}
        subText="Active routes this month"
        icon="fuel"
        variant="default"
      />

      {/* Row 3 — Alerts & announcements */}
      <KpiCard
        label="Pending Routes"
        value={kpis.pendingRoutes}
        subText="Awaiting status update"
        icon="clock"
        variant={kpis.pendingRoutes > 0 ? "warning" : "default"}
      />
      <KpiCard
        label="Open Incidents"
        value={kpis.openIncidents}
        subText="Last 7 days"
        icon="alert-triangle"
        variant={kpis.openIncidents > 0 ? "danger" : "default"}
      />
      <KpiCard
        label="Active Announcements"
        value={kpis.activeAnnouncements}
        subText="Currently published"
        icon="announcements"
        variant={kpis.activeAnnouncements > 0 ? "info" : "default"}
      />
    </div>
  );
}