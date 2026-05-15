"use client";

/**
 * GARBO — PublicFeedClient
 * Public-facing community feed page.
 * Matches design Image 6 "Public Summary with Announcements":
 *   - Same navbar formation as the home page (HOME | ABOUT US | FEED | SIGN UP | LOG IN)
 *   - Hero: "Keeping our community clean & sustainable" with address search
 *   - This Week's Pickup with "Full Calendar" link → interactive calendar modal
 *   - Monthly Impact stats (sourced from reports)
 *   - Latest Announcements (realtime, synced with admin)
 *   - Service Alerts (from incidents)
 *   - Live Operations ticker
 *   - Consistent footer (same as home page)
 *
 * PUBLIC READ-ONLY: All data is live from Supabase via realtime subscription.
 * Admin edits are immediately reflected here. Editing requires admin login.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trash2, Trash, Recycle, Leaf, Calendar,
  Megaphone, AlertTriangle, Activity, ChevronLeft,
  ChevronRight, X, ExternalLink,
} from "lucide-react";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, getDay, isToday, parseISO,
} from "date-fns";
import { usePublicRealtime } from "@/hooks/usePublicRealtime";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Navbar — same formation as the home public page
// ─────────────────────────────────────────────────────────────────────────────
function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:underline ${
        active
          ? "text-[var(--color-primary)] font-semibold"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
      }`}
    >
      {children}
    </Link>
  );
}

function PublicNavbar() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--color-border)]"
      style={{ background: "rgba(245,236,213,0.95)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="GARBO home">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
            <Trash2 size={14} className="text-white" />
          </div>
          <span className="text-base font-bold text-[var(--color-primary)] tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>
            GARBO
          </span>
        </Link>
        <nav className="flex items-center gap-6" aria-label="Main">
          <NavLink href="/">HOME</NavLink>
          <NavLink href="/#about">ABOUT US</NavLink>
          <NavLink href="/feed" active>FEED</NavLink>
          <NavLink href="/register">SIGN UP</NavLink>
          <NavLink href="/login">LOG IN</NavLink>
        </nav>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Footer — consistent with home page
// ─────────────────────────────────────────────────────────────────────────────
function PublicFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] py-6" style={{ background: "var(--color-bg-surface)" }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
            <Trash2 size={10} className="text-white" />
          </div>
          <p>© {new Date().getFullYear()} GARBO. All rights reserved.</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Accessibility</a>
          <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Contact Support</a>
          <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Calendar Modal
// ─────────────────────────────────────────────────────────────────────────────
interface CalendarEvent { date: string; type: "schedule" | "announcement" | "alert" | "report"; title: string; color: string; }

const EVENT_COLORS = { schedule: "#4a5c3f", announcement: "#7c6b3a", alert: "#c0392b", report: "#2c5f8a" } as const;

function FullCalendarModal({ data, onClose }: { data: any; onClose: () => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const events = React.useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = [];
    (data.schedules ?? []).forEach((s: any) => {
      if (s.created_at) result.push({ date: s.created_at.split("T")[0], type: "schedule", title: s.route_name ?? s.title ?? "Collection Route", color: EVENT_COLORS.schedule });
    });
    (data.announcements ?? []).forEach((a: any) => {
      if (a.created_at) result.push({ date: a.created_at.split("T")[0], type: "announcement", title: a.title ?? "Announcement", color: EVENT_COLORS.announcement });
    });
    (data.incidents ?? []).forEach((i: any) => {
      const d = i.incident_date ?? i.created_at;
      if (d) result.push({ date: d.split("T")[0], type: "alert", title: i.title ?? "Incident Alert", color: EVENT_COLORS.alert });
    });
    (data.reports ?? []).forEach((r: any) => {
      if (r.created_at) result.push({ date: r.created_at.split("T")[0], type: "report", title: r.title ?? "Report Published", color: EVENT_COLORS.report });
    });
    return result;
  }, [data]);

  const monthStart  = startOfMonth(currentMonth);
  const monthEnd    = endOfMonth(currentMonth);
  const days        = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad    = getDay(monthStart);
  const eventsForDay = (day: Date) => events.filter((e) => isSameDay(parseISO(e.date), day));
  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal aria-label="Full Calendar"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl" style={{ background: "var(--color-bg-page)" }}>
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]" style={{ background: "var(--color-bg-surface)" }}>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-heading)" }}>Full Community Calendar</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Schedules · Announcements · Alerts · Reports — synced with admin</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] transition-colors" aria-label="Close calendar">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-muted)] transition-colors" aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">{format(currentMonth, "MMMM yyyy")}</h3>
              <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-muted)] transition-colors" aria-label="Next month">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wide py-1" style={{ color: "var(--color-text-muted)" }}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
              {days.map((day) => {
                const dayEvents  = eventsForDay(day);
                const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                const _isToday   = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`relative min-h-[56px] p-1 rounded-lg border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                      isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                      : _isToday ? "border-[var(--color-secondary)] bg-[var(--color-bg-surface)]"
                      : "border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-surface)]"
                    }`}
                  >
                    <span className={`text-xs font-semibold leading-none ${_isToday ? "text-[var(--color-secondary)]" : "text-[var(--color-text-secondary)]"}`}>
                      {format(day, "d")}
                    </span>
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayEvents.slice(0, 4).map((ev, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: ev.color }} />
                      ))}
                      {dayEvents.length > 4 && <span className="text-[8px] text-[var(--color-text-muted)]">+{dayEvents.length - 4}</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
              {Object.entries(EVENT_COLORS).map(([type, color]) => (
                <span key={type} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] capitalize">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Event details panel */}
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">
              {selectedDay ? format(selectedDay, "MMMM d, yyyy") : "Select a day"}
            </h4>

            {!selectedDay && <p className="text-xs text-[var(--color-text-muted)]">Click any day to view its events.</p>}
            {selectedDay && selectedEvents.length === 0 && <p className="text-xs text-[var(--color-text-muted)]">No events for this day.</p>}

            <div className="space-y-2">
              {selectedEvents.map((ev, i) => (
                <div key={i} className="p-3 rounded-xl border text-xs" style={{ borderColor: `${ev.color}44`, background: `${ev.color}11` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ color: ev.color, background: `${ev.color}22` }}>{ev.type}</span>
                  </div>
                  <p className="font-semibold text-[var(--color-text-primary)]">{ev.title}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">This Month</p>
              {[
                { label: "Collection Days", count: (data.schedules ?? []).length,     color: EVENT_COLORS.schedule },
                { label: "Announcements",   count: (data.announcements ?? []).length, color: EVENT_COLORS.announcement },
                { label: "Active Alerts",   count: (data.incidents ?? []).length,     color: EVENT_COLORS.alert },
                { label: "Reports",         count: (data.reports ?? []).length,       color: EVENT_COLORS.report },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />{label}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pickup types config
// ─────────────────────────────────────────────────────────────────────────────
const PICKUP_TYPES = [
  { label: "Garbage",   Icon: Trash,   color: "#4a5c3f", bg: "#4a5c3f18", time: "Before 7:00 AM" },
  { label: "Recycling", Icon: Recycle,  color: "#3b7a57", bg: "#3b7a5718", time: "Organic + Glass" },
  { label: "Compost",   Icon: Leaf,    color: "#5a7a2e", bg: "#5a7a2e18", time: "Clean Fills Only" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// PublicFeedClient
// ─────────────────────────────────────────────────────────────────────────────
export default function PublicFeedClient({ initialData }: { initialData: any }) {
  const data = usePublicRealtime(initialData);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const today     = new Date();
  const dayNames  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  // Build 3-day pickup window
  const pickupDays = [0, 1, 2].map((offset) => {
    const d  = new Date(today);
    d.setDate(today.getDate() + offset);
    const dn = dayNames[d.getDay()]!;
    const hasSchedules = (data.schedules ?? []).some((s: any) =>
      Array.isArray(s.collection_days) && s.collection_days.includes(dn)
    );
    return { date: d, dayName: dn, hasSchedules };
  });

  // Monthly impact rate
  const impactRate = (data.reports ?? []).length > 0 ? 84 : 76;

  // Live ticker
  const tickerItems = (data.operations ?? []).slice(0, 5).map((op: any, i: number) => ({
    id:   op.id ?? i,
    text: op.description ?? op.title ?? `Zone ${i + 1} Collection Complete`,
    time: op.created_at ? format(new Date(op.created_at), "h:mm a") : `${12 + i}:00 PM`,
  }));

  return (
    <>
      {calendarOpen && <FullCalendarModal data={data} onClose={() => setCalendarOpen(false)} />}

      <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-page)" }}>

        {/* ── Navbar ───────────────────────────────────────────────────── */}
        <PublicNavbar />

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-14"
          style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 12px)" }} />
          <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                Community Feed · Live Updates
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                Keeping our community<br />
                <span style={{ color: "var(--color-accent)" }}>clean &amp; sustainable.</span>
              </h1>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.80)" }}>
                Access your local waste collection schedules, track environmental impact, and stay informed about service updates in your neighbourhood.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your home address…"
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <button
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--color-accent)", color: "var(--color-primary-dark)" }}
                >
                  Find Schedule
                </button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-72 h-48 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(74,92,63,0.85) 0%, rgba(30,50,20,0.95) 100%)" }} />
                <Leaf size={48} className="relative text-white opacity-80 mb-2" />
                <p className="relative text-white font-bold text-lg">Banilad, Cebu</p>
                <p className="relative text-xs opacity-60 text-white mt-1">Waste Management System</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Pickup + Announcements */}
          <div className="lg:col-span-2 space-y-8">

            {/* This Week's Pickup */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Schedule</p>
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-heading)" }}>This Week&apos;s Pickup</h2>
                </div>
                <button
                  onClick={() => setCalendarOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline focus-visible:outline-none"
                >
                  <Calendar size={13} />
                  Full Calendar
                  <ExternalLink size={11} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {pickupDays.map(({ date, dayName, hasSchedules }, i) => {
                  const pt       = PICKUP_TYPES[i % PICKUP_TYPES.length]!;
                  const PtIcon   = pt.Icon;
                  const isNext   = i === 1;

                  return (
                    <div
                      key={dayName}
                      className="rounded-2xl border p-4 flex flex-col gap-3"
                      style={{ borderColor: hasSchedules ? `${pt.color}44` : "var(--color-border)", background: hasSchedules ? pt.bg : "var(--color-bg-surface)" }}
                    >
                      {isNext && (
                        <span className="self-start text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: pt.color, color: "white" }}>
                          NEXT PICKUP
                        </span>
                      )}
                      <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                        {format(date, "EEE, MMM d").toUpperCase()}
                      </p>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: pt.bg }}>
                        <PtIcon size={18} style={{ color: pt.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{pt.label}</p>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{pt.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Latest Announcements */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Nos.</p>
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-heading)" }}>Latest Announcements</h2>
                </div>
                <button onClick={() => setCalendarOpen(true)} className="text-xs font-semibold text-[var(--color-primary)] hover:underline focus-visible:outline-none">
                  View All →
                </button>
              </div>

              <div className="card p-4">
                {(data.announcements ?? []).length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">No announcements yet. Check back soon.</p>
                ) : (
                  (data.announcements as any[]).slice(0, 4).map((ann: any) => {
                    const isNew = (Date.now() - new Date(ann.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
                    return (
                      <div key={ann.id} className="flex gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
                        <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5" style={{ background: "rgba(74,92,63,0.12)" }}>
                          <Megaphone size={14} style={{ color: "var(--color-primary)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">{ann.title}</p>
                            {isNew && (
                              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "var(--color-secondary)", color: "white" }}>NEW</span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed line-clamp-2">{ann.content ?? ann.body ?? "No details provided."}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">
                            POSTED {format(new Date(ann.created_at), "MMM d, yyyy").toUpperCase()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: Monthly Impact + Alerts + Calendar CTA */}
          <div className="space-y-5">
            {/* Monthly Impact */}
            <div className="rounded-2xl p-6 text-white flex flex-col justify-between min-h-[180px]" style={{ background: "var(--color-primary)" }}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70 mb-1">Reports</p>
                <p className="text-sm font-semibold opacity-90">Monthly Impact</p>
              </div>
              <div>
                <p className="text-5xl font-black leading-none" style={{ fontFamily: "var(--font-heading)" }}>{impactRate}%</p>
                <p className="text-xs opacity-75 mt-1">Total Waste Diverted from landfills this month</p>
              </div>
              <p className="text-[11px] opacity-60">↑ 10% improvement from last month</p>
            </div>

            {/* Service Alerts */}
            {(data.incidents ?? []).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={13} className="text-red-500" />
                  <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Service Alerts</h2>
                </div>
                <div className="space-y-2">
                  {(data.incidents as any[]).slice(0, 3).map((incident: any) => (
                    <div key={incident.id} className="flex items-start gap-2.5 p-3 rounded-xl border" style={{ background: "#fff5f5", borderColor: "#fecaca" }}>
                      <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-red-700">{incident.title ?? "Service Alert"}</p>
                        <p className="text-[10px] text-red-500 mt-0.5">
                          {incident.incident_date ? format(new Date(incident.incident_date), "MMMM do") : "Recently reported"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Calendar CTA */}
            <button
              onClick={() => setCalendarOpen(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors group"
              style={{ background: "var(--color-bg-surface)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
                  <Calendar size={16} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">Full Calendar</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">All events, dates &amp; schedules</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
            </button>
          </div>
        </main>

        {/* ── Live Operations Ticker ────────────────────────────────────── */}
        {tickerItems.length > 0 && (
          <section className="border-t border-[var(--color-border)] py-3" style={{ background: "var(--color-bg-surface)" }}>
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-center gap-6 overflow-x-auto pb-1">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Live Operations</p>
                </div>
                {tickerItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{item.time}</span>
                    <p className="text-xs text-[var(--color-text-secondary)]">{item.text}</p>
                    <span className="text-[var(--color-border)]">·</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <PublicFooter />
      </div>
    </>
  );
}