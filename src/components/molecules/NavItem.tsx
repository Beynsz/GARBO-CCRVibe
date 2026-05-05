"use client";

/**
 * GARBO — NavItem Molecule
 * SDD §3.2.2 FR-2.3 — Sidebar Menu Item (Icon + Label).
 * Hover/active states, icon for visual recognition, optional badge count.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/atoms/Icon";
import { CountBadge } from "@/components/atoms/Badge";

interface NavItemProps {
  href:      string;
  label:     string;
  icon:      IconName;
  badge?:    number;
  onClick?:  () => void;
}

export function NavItem({ href, label, icon, badge, onClick }: NavItemProps) {
  const pathname  = usePathname();
  const isActive  = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        // Base — matches .nav-item in globals.css
        "flex items-center gap-3 px-4 py-2.5 rounded-md",
        "text-sm font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[rgba(253,250,244,0.5)] focus-visible:ring-offset-1",
        // Active vs inactive
        isActive
          ? "bg-[rgba(253,250,244,0.18)] text-[var(--color-text-on-primary)] font-semibold"
          : "text-[rgba(253,250,244,0.75)] hover:bg-[rgba(253,250,244,0.10)] hover:text-[var(--color-text-on-primary)]"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Icon */}
      <Icon
        name={icon}
        size={18}
        className={cn(
          "shrink-0 transition-colors duration-150",
          isActive
            ? "text-[var(--color-text-on-primary)]"
            : "text-[rgba(253,250,244,0.65)]"
        )}
      />

      {/* Label */}
      <span className="flex-1 truncate">{label}</span>

      {/* Alert badge */}
      {badge !== undefined && badge > 0 && (
        <CountBadge count={badge} />
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Logout button — same visual style as NavItem but triggers auth signout
// ─────────────────────────────────────────────────────────────────────────────
interface LogoutNavItemProps {
  onLogout: () => void;
}

export function LogoutNavItem({ onLogout }: LogoutNavItemProps) {
  return (
    <button
      onClick={onLogout}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-md",
        "text-sm font-medium transition-all duration-150",
        "text-[rgba(253,250,244,0.75)]",
        "hover:bg-[rgba(244,67,54,0.20)] hover:text-[#ffcdd2]",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[rgba(253,250,244,0.5)] focus-visible:ring-offset-1"
      )}
      aria-label="Log out"
    >
      <Icon name="logout" size={18} className="shrink-0 text-[rgba(253,250,244,0.65)]" />
      <span>Logout</span>
    </button>
  );
}