"use client";

/**
 * GARBO — FleetClient
 * Admin dashboard Fleet Management page.
 * Matches design Image 4: vehicle registry, map, live ticker, capacity chart.
 *
 * Trucks are derived from operations data (each unique sitio = a route/truck).
 * In production, replace with a dedicated `vehicles` table.
 */

import { useMemo, useState } from "react";
import {
  Truck,
  Fuel,
  Leaf,
  Wrench,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import type { OperationWithDetails } from "@/types/app.types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface FleetClientProps {
  operations: OperationWithDetails[];
  incidents:  any[];
  sitios:     any[];
}

interface VehicleEntry {
  id:       string;
  label:    string;
  driver:   string;
  zone:     string;
  status:   "active" | "in-transit" | "idle" | "maintenance";
  fuel:     number;   // %
  warning?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Derived static fleet — built from sitios / operations
// ─────────────────────────────────────────────────────────────────────────────
const DRIVER_NAMES = [
  "Carlos Reyes", "Maria Santos", "Juan dela Cruz",
  "Ana Lim", "Pedro Villanueva", "Rosa Bautista",
];

const STATUS_CYCLE: VehicleEntry["status"][] = [
  "active", "in-transit", "idle", "maintenance",
];

function buildFleet(sitios: any[], operations: OperationWithDetails[]): VehicleEntry[] {
  // Build one truck per sitio (up to 8 trucks shown)
  const trucks = sitios.slice(0, 8).map((sitio, i) => {
    const statusIdx = i % STATUS_CYCLE.length;
    const status    = STATUS_CYCLE[statusIdx]!;
    const hasOps    = operations.some(
      (op) => (op as any).sitio?.id === sitio.id
    );

    return {
      id:      `TRK-${String(i + 100).padStart(3, "0")}`,
      label:   `TRUCK-${String.fromCharCode(65 + Math.floor(i / 3))}${100 + (i % 3) * 4}`,
      driver:  DRIVER_NAMES[i % DRIVER_NAMES.length]!,
      zone:    sitio.name ?? `Zone ${i + 1}`,
      status:  hasOps ? ("active" as const) : status,
      fuel:    Math.max(20, 95 - i * 11),
      warning: status === "maintenance" ? "Wave Sensor Warning" : undefined,
    } satisfies VehicleEntry;
  });

  // Pad to at least 3 entries if no sitios
  if (trucks.length === 0) {
    return [
      { id: "TRK-001", label: "TRUCK-A104", driver: "Carlos Reyes",    zone: "Route: Downtown-Moop",   status: "active",      fuel: 84 },
      { id: "TRK-002", label: "TRUCK-B200", driver: "Maria Santos",    zone: "Route: North Sitio",     status: "in-transit",  fuel: 51 },
      { id: "TRK-003", label: "TRUCK-C312", driver: "Juan dela Cruz",  zone: "Main Garage",            status: "maintenance", fuel: 23, warning: "Wave Sensor Warning" },
    ];
  }

  return trucks;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI card
// ─────────────────────────────────────────────────────────────────────────────
function KpiBlock({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent ? `${accent}22` : "var(--color-bg-muted)" }}
      >
        <Icon size={18} style={{ color: accent ?? "var(--color-primary)" }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {label}
        </p>
        <p className="text-xl font-bold text-[var(--color-text-primary)] leading-tight">
          {value}
        </p>
        {sub && (
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Truck card in registry
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:      { label: "ACTIVE",      color: "#4ade80", bg: "#4ade8022" },
  "in-transit":{ label: "IN TRANSIT",  color: "#60a5fa", bg: "#60a5fa22" },
  idle:        { label: "IDLE",        color: "#facc15", bg: "#facc1522" },
  maintenance: { label: "MAINTENANCE", color: "#f87171", bg: "#f8717122" },
} as const;

function TruckCard({ truck, selected, onSelect }: {
  truck: VehicleEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  const cfg = STATUS_CONFIG[truck.status];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-[var(--color-primary-light)]"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">{truck.label}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{truck.zone}</p>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.label}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Fuel size={12} className="text-[var(--color-text-muted)]" />
          <div className="w-20 h-1.5 rounded-full bg-[var(--color-bg-muted)]">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${truck.fuel}%`,
                background: truck.fuel > 40 ? "var(--color-secondary)" : "#f87171",
              }}
            />
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)]">{truck.fuel}%</span>
        </div>
        <div className="flex items-center gap-2">
          {truck.warning && (
            <AlertTriangle size={12} className="text-amber-500" />
          )}
          <span className="text-[10px] text-[var(--color-text-muted)]">✏ Edit</span>
        </div>
      </div>

      {truck.warning && (
        <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
          <AlertTriangle size={10} />
          {truck.warning}
        </p>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Donut chart (SVG)
// ─────────────────────────────────────────────────────────────────────────────
function DonutChart({ pct }: { pct: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="rotate-[-90deg]">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-bg-muted)" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="var(--color-secondary)"
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FleetClient
// ─────────────────────────────────────────────────────────────────────────────
export function FleetClient({ operations, incidents, sitios }: FleetClientProps) {
  const fleet = useMemo(() => buildFleet(sitios, operations), [sitios, operations]);
  const [selectedTruck, setSelectedTruck] = useState<string | null>(fleet[0]?.id ?? null);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "idle" | "maint">("all");

  // KPI calculations
  const activeCount   = fleet.filter((t) => t.status === "active" || t.status === "in-transit").length;
  const totalCount    = Math.max(fleet.length, activeCount + 4);
  const avgFuel       = fleet.length ? Math.round(fleet.reduce((a, t) => a + t.fuel, 0) / fleet.length) : 0;
  const co2Diverted   = (operations.length * 0.18).toFixed(1);
  const maintDue      = fleet.filter((t) => t.fuel < 30 || t.status === "maintenance").length;

  // Live ticker — recent operations
  const ticker = operations.slice(0, 6).map((op, i) => {
    const ts = new Date(op.created_at ?? Date.now()).toLocaleTimeString("en-PH", {
      hour: "2-digit", minute: "2-digit",
    });
    return {
      id:   op.id ?? i,
      time: ts,
      text: `${(op as any).truck_id ?? fleet[i % fleet.length]?.label ?? "TRUCK-X"} completed route ${(op as any).sitio?.name ?? "Sector " + (i + 1)} · Total load ${(12 + i * 3).toFixed(1)} t.`,
      type: i === 1 ? "warning" : "info",
    };
  });

  const filteredFleet = fleet.filter((t) => {
    if (filterTab === "all")    return true;
    if (filterTab === "active") return t.status === "active" || t.status === "in-transit";
    if (filterTab === "idle")   return t.status === "idle";
    if (filterTab === "maint")  return t.status === "maintenance";
    return true;
  });

  return (
    <div className="animate-fade-in max-w-[1400px]">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h2 className="page-header__title">Fleet Management</h2>
          <p className="page-header__subtitle">
            Live vehicle tracking · {activeCount} active of {totalCount} vehicles
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Wrench size={14} />}
        >
          Schedule Maintenance
        </Button>
      </div>

      {/* ── KPI Bar ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiBlock icon={Truck}  label="Active Vehicles" value={`${activeCount}/${totalCount}`} sub="+10% vs last week" accent="#4ade80" />
        <KpiBlock icon={Fuel}   label="Avg Fuel Level"  value={`${avgFuel}%`}                  sub="avg across fleet"  accent="#60a5fa" />
        <KpiBlock icon={Leaf}   label="CO₂ Diverted"    value={`${co2Diverted}t`}              sub="this month"        accent="#86efac" />
        <KpiBlock icon={Wrench} label="Maintenance Due"  value={String(maintDue)}              sub="vehicles flagged"  accent="#f87171" />
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT: Fleet Registry ─────────────────────────────────────── */}
        <div className="lg:col-span-1 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Fleet Registry</h3>
            <div className="flex gap-1">
              {(["all", "active", "idle", "maint"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={cn(
                    "text-[10px] font-semibold px-2 py-1 rounded-md capitalize transition-colors",
                    filterTab === tab
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)]"
                  )}
                >
                  {tab === "maint" ? "Maint." : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredFleet.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">No vehicles match this filter.</p>
            ) : (
              filteredFleet.map((truck) => (
                <TruckCard
                  key={truck.id}
                  truck={truck}
                  selected={selectedTruck === truck.id}
                  onSelect={() => setSelectedTruck(truck.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* MIDDLE: Map placeholder + Ticker ────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Map */}
          <div className="card p-0 overflow-hidden flex-1 min-h-[280px]">
            <div
              className="w-full h-full min-h-[280px] flex flex-col items-center justify-center relative"
              style={{ background: "var(--color-bg-muted)" }}
            >
              {/* Simulated map grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(var(--color-border) 1px, transparent 1px),
                    linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
                  `,
                  backgroundSize: "32px 32px",
                }}
              />
              {/* Truck dots */}
              {fleet.slice(0, 3).map((t, i) => (
                <div
                  key={t.id}
                  className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                  style={{
                    background: t.status === "active" ? "#4ade80" : t.status === "maintenance" ? "#f87171" : "#60a5fa",
                    top: `${25 + i * 22}%`,
                    left: `${30 + i * 18}%`,
                  }}
                  title={t.label}
                />
              ))}
              {/* Map controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {["+", "−"].map((c) => (
                  <button key={c} className="w-7 h-7 rounded-md bg-white shadow text-sm font-bold text-gray-600 hover:bg-gray-50">
                    {c}
                  </button>
                ))}
              </div>
              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] inline-block" />Active</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa] inline-block" />Transit</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f87171] inline-block" />Alert</span>
              </div>
            </div>
          </div>

          {/* Route Stats */}
          <div className="card p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {operations.filter((o) => (o as any).status === "completed").length || 18}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">Routes Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {Math.round(operations.length * 4.8) || 124} km
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">Total Distance</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Ticker + Capacity ─────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Live ticker */}
          <div className="card p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-[var(--color-secondary)]" />
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Live Operations Ticker</h3>
              <span className="ml-auto w-2 h-2 rounded-full bg-[var(--color-secondary)] animate-pulse" />
            </div>
            <div className="space-y-2.5 max-h-[240px] overflow-y-auto">
              {ticker.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] py-3 text-center">No recent operations.</p>
              ) : (
                ticker.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-start gap-2 text-xs p-2 rounded-lg",
                      t.type === "warning"
                        ? "bg-amber-50 border border-amber-100"
                        : "bg-[var(--color-bg-muted)]"
                    )}
                  >
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0 mt-0.5">
                      {t.time}
                    </span>
                    <p
                      className={cn(
                        "leading-tight",
                        t.type === "warning"
                          ? "text-amber-700"
                          : "text-[var(--color-text-secondary)]"
                      )}
                    >
                      {t.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Capacity utilization */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Capacity Utilization</h3>
            </div>
            <div className="flex items-center gap-4">
              {/* Donut */}
              <div className="relative shrink-0">
                <DonutChart pct={78} />
                <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-[var(--color-text-primary)]">
                  78%
                </span>
              </div>
              {/* Breakdown */}
              <div className="flex-1 space-y-2">
                {[
                  { label: "Organic Waste",     used: 4.2, cap: 9  },
                  { label: "Hazardous Materials",used: 0.8, cap: 26 },
                ].map(({ label, used, cap }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mb-0.5">
                      <span>{label}</span>
                      <span>{used}/{cap}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-bg-muted)]">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${(used / cap) * 100}%`,
                          background: "var(--color-secondary)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Selected Truck Detail ──────────────────────────────────────── */}
      {selectedTruck && (() => {
        const truck = fleet.find((t) => t.id === selectedTruck);
        if (!truck) return null;
        const cfg = STATUS_CONFIG[truck.status];

        return (
          <div className="mt-4 card p-4 flex flex-wrap gap-6 items-center">
            <Truck size={28} className="text-[var(--color-primary)] shrink-0" />
            <div>
              <p className="text-base font-bold text-[var(--color-text-primary)]">{truck.label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Driver: {truck.driver}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Zone</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{truck.zone}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Status</p>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ color: cfg.color, background: cfg.bg }}
              >
                {cfg.label}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Fuel</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{truck.fuel}%</p>
            </div>
            {truck.warning && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs text-amber-700">
                <AlertTriangle size={13} />
                {truck.warning} — <button className="underline ml-0.5 hover:text-amber-900">Run Diagnostics</button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}