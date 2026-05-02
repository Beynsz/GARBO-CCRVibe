"use client";

/**
 * GARBO — TopBar Organism
 * SDD §4.2.1 — Top navigation header visible on all dashboard pages.
 * Matches Images 3-4: page title left, search + profile right.
 */

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, User, ChevronDown, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Page title map
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  "/home":          "Home",
  "/schedule":      "Schedule",
  "/announcements": "Announcements",
  "/reports":       "Reports",
  "/alerts":        "Alerts",
  "/logbook":       "Logbook",
};

// ─────────────────────────────────────────────────────────────────────────────
// TopBar Component
// ─────────────────────────────────────────────────────────────────────────────
interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  const pathname   = usePathname();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery,  setSearchQuery ] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  // Derive page title from pathname
  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1]
    ?? "GARBO";

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        "h-[var(--topbar-height)] flex items-center justify-between",
        "px-6 border-b border-[var(--color-border)]",
        "bg-[var(--color-bg-surface)] shrink-0",
        className
      )}
    >
      {/* ── Left: Page title ─────────────────────────────────────────── */}
      <h1
        className="text-xl font-bold text-[var(--color-text-primary)] lg:ml-0 ml-12"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {pageTitle}
      </h1>

      {/* ── Right: Search + Profile ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden md:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-9 w-52 pl-9 pr-4 text-sm rounded-md",
              "bg-[var(--color-bg-page)] border border-[var(--color-border)]",
              "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "focus:outline-none focus:border-[var(--color-border-focus)]",
              "focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20",
              "transition-all duration-150"
            )}
            aria-label="Search GARBO"
          />
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-2 h-9 px-3 rounded-md",
              "border border-[var(--color-border)]",
              "bg-[var(--color-bg-page)] hover:bg-[var(--color-bg-table-stripe)]",
              "text-sm text-[var(--color-text-secondary)]",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-30"
            )}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            aria-label="User menu"
          >
            {/* Avatar */}
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                "bg-[var(--color-secondary)] text-[var(--color-text-on-primary)]",
                "text-[10px] font-bold"
              )}
              aria-hidden="true"
            >
              {user?.email ? getInitials(user.email) : <User size={12} />}
            </span>

            <span className="hidden sm:block max-w-[120px] truncate text-xs font-medium">
              {user?.email ?? "Admin"}
            </span>

            <ChevronDown
              size={14}
              className={cn(
                "text-[var(--color-text-muted)] transition-transform duration-150",
                profileOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          {/* Dropdown menu */}
          {profileOpen && (
            <div
              className={cn(
                "absolute right-0 top-full mt-2 w-48",
                "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
                "rounded-lg shadow-[var(--shadow-modal)]",
                "z-[var(--z-dropdown)] overflow-hidden",
                "animate-fade-in"
              )}
              role="menu"
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                  {user?.email}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                  Barangay Admin
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm",
                    "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-table-stripe)]",
                    "hover:text-[var(--color-text-primary)] transition-colors",
                    "focus-visible:outline-none focus-visible:bg-[var(--color-bg-table-stripe)]"
                  )}
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={15} aria-hidden="true" />
                  Settings
                </button>
              </div>

              {/* Logout */}
              <div className="py-1 border-t border-[var(--color-border)]">
                <button
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm",
                    "text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]",
                    "transition-colors focus-visible:outline-none",
                    "focus-visible:bg-[var(--color-danger-bg)]"
                  )}
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); logout(); }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
function getInitials(email: string): string {
  const name  = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}