"use client";

/**
 * GARBO — Sidebar Organism
 * SDD §4.1.1 — Navigation Sidebar
 * Uses client-side Next.js routing, active route highlighting.
 * Matches Images 3-7: olive-green sidebar with nav items + user info at bottom.
 */

import { useState } from "react";
import Link from "next/link";
import { Trash2, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NavItem, LogoutNavItem } from "@/components/molecules/NavItem";
import { cn } from "@/lib/utils/cn";
import type { NavItem as NavItemType } from "@/types/app.types";

// ─────────────────────────────────────────────────────────────────────────────
// Navigation config
// SDD §3.2.1 FR-1.5 — Sidebar icons: Home, Schedule, Announcements, Reports, Alerts
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItemType[] = [
  { label: "Home",          href: "/home",          icon: "home"          },
  { label: "Schedule",      href: "/schedule",      icon: "schedule"      },
  { label: "Announcements", href: "/announcements", icon: "announcements" },
  { label: "Reports",       href: "/reports",       icon: "reports"       },
  { label: "Alerts",        href: "/alerts",        icon: "alerts"        },
  { label: "Logbook",       href: "/logbook",       icon: "clipboard"     },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface SidebarProps {
  alertCount?: number;   // Drives the badge on the Alerts nav item
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar component
// ─────────────────────────────────────────────────────────────────────────────
export function Sidebar({ alertCount = 0 }: SidebarProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <nav
      className="flex flex-col h-full"
      aria-label="Main navigation"
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <Link
        href="/home"
        className={cn(
          "flex items-center gap-3 px-4 py-5 mb-2",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[rgba(253,250,244,0.5)] focus-visible:ring-offset-1 rounded-md"
        )}
        aria-label="GARBO — Go to dashboard"
      >
        <div className="w-8 h-8 rounded-lg bg-[rgba(253,250,244,0.18)] flex items-center justify-center shrink-0">
          <Trash2 size={18} className="text-[var(--color-text-on-primary)]" aria-hidden="true" />
        </div>
        <span
          className="text-xl font-bold text-[var(--color-text-on-primary)] tracking-wide"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          GARBO
        </span>
      </Link>

      {/* ── Nav links ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon as Parameters<typeof NavItem>[0]["icon"]}
            badge={item.href === "/alerts" ? alertCount : undefined}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </div>

      {/* ── User info + logout ────────────────────────────────────────── */}
      <div className="mt-auto px-2 pb-4 border-t border-[rgba(253,250,244,0.12)] pt-4">
        {/* User profile */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-2.5 mb-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                "bg-[var(--color-secondary)] text-[var(--color-text-on-primary)]",
                "text-xs font-bold uppercase"
              )}
              aria-hidden="true"
            >
              {getInitials(user.email ?? "")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--color-text-on-primary)] truncate">
                {user.email}
              </p>
              <p className="text-[10px] text-[rgba(253,250,244,0.55)]">
                Barangay Admin
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <LogoutNavItem onLogout={logout} />
      </div>
    </nav>
  );

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col",
          "w-[var(--sidebar-width)] min-h-screen shrink-0",
          "bg-[var(--color-bg-sidebar)]"
        )}
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile: hamburger button ─────────────────────────────────── */}
      <button
        className={cn(
          "lg:hidden fixed top-4 left-4 z-[var(--z-modal)]",
          "w-10 h-10 rounded-lg flex items-center justify-center",
          "bg-[var(--color-bg-sidebar)] text-[var(--color-text-on-primary)]",
          "shadow-md focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[var(--color-primary)]"
        )}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* ── Mobile: overlay + drawer ─────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 z-[calc(var(--z-modal)-1)] bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside
            className={cn(
              "lg:hidden fixed inset-y-0 left-0 z-[var(--z-modal)]",
              "w-[var(--sidebar-width)]",
              "bg-[var(--color-bg-sidebar)]",
              "shadow-[var(--shadow-modal)]",
              "animate-slide-in"
            )}
          >
            {/* Close button */}
            <button
              className={cn(
                "absolute top-4 right-4",
                "w-8 h-8 rounded-md flex items-center justify-center",
                "text-[rgba(253,250,244,0.65)] hover:text-[var(--color-text-on-primary)]",
                "hover:bg-[rgba(253,250,244,0.10)] transition-colors",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[rgba(253,250,244,0.5)]"
              )}
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={18} aria-hidden="true" />
            </button>

            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
function getInitials(email: string): string {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}