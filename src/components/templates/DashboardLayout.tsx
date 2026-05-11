"use client";

/**
 * GARBO — DashboardLayout Template
 * SDD §4.2 — Templates & Page Layouts
 * The sidebar is fixed on the left; the main content area updates dynamically.
 * Matches all dashboard screenshots: Images 3-7.
 */

import { Sidebar } from "@/components/organisms/Sidebar";
import { TopBar }  from "@/components/organisms/TopBar";
import { cn } from "@/lib/utils/cn";

interface DashboardLayoutProps {
  children:    React.ReactNode;
  alertCount?: number;
  className?:  string;
}

export function DashboardLayout({
  children,
  alertCount = 0,
  className,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-page)]">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <Sidebar alertCount={alertCount} />

      {/* ── Main area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "px-[var(--page-padding-x)] py-[var(--page-padding-y)]",
            "animate-fade-in",
            className
          )}
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          className={cn(
            "shrink-0 flex items-center justify-between",
            "px-[var(--page-padding-x)] py-3",
            "border-t border-[var(--color-border)]",
            "bg-[var(--color-bg-surface)]"
          )}
        >
          <span className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} GARBO. All rights reserved.
          </span>
          <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">
              Contact Us
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}