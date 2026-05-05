"use client";

/**
 * GARBO — Icon Atom
 * SDD §3.2.1 FR-1.5 — Sidebar + UI icons (Home, Schedule, Announcements,
 * Reports, Alerts, Logout). Minimal and consistent design style.
 *
 * Thin wrapper around lucide-react for consistent sizing and colour tokens.
 */

import {
  Home,
  CalendarDays,
  Megaphone,
  BarChart2,
  Bell,
  LogOut,
  Trash2,
  Search,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Plus,
  Pencil,
  Trash,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  FileText,
  ClipboardList,
  MapPin,
  Clock,
  Fuel,
  Weight,
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  Menu,
} from "lucide-react";

export type IconName =
  | "home" | "schedule" | "announcements" | "reports" | "alerts" | "logout"
  | "trash" | "search" | "user" | "chevron-down" | "chevron-left" | "chevron-right"
  | "chevron-up" | "plus" | "edit" | "delete" | "check" | "x" | "alert-triangle"
  | "info" | "check-circle" | "x-circle" | "alert-circle" | "filter" | "download"
  | "file-text" | "clipboard" | "map-pin" | "clock" | "fuel" | "weight"
  | "calendar" | "refresh" | "eye" | "eye-off" | "more" | "arrow-left"
  | "arrow-right" | "menu";

const ICON_MAP: Record<IconName, React.ElementType> = {
  home:            Home,
  schedule:        CalendarDays,
  announcements:   Megaphone,
  reports:         BarChart2,
  alerts:          Bell,
  logout:          LogOut,
  trash:           Trash2,
  search:          Search,
  user:            User,
  "chevron-down":  ChevronDown,
  "chevron-left":  ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up":    ChevronUp,
  plus:            Plus,
  edit:            Pencil,
  delete:          Trash,
  check:           Check,
  x:               X,
  "alert-triangle":AlertTriangle,
  info:            Info,
  "check-circle":  CheckCircle2,
  "x-circle":      XCircle,
  "alert-circle":  AlertCircle,
  filter:          Filter,
  download:        Download,
  "file-text":     FileText,
  clipboard:       ClipboardList,
  "map-pin":       MapPin,
  clock:           Clock,
  fuel:            Fuel,
  weight:          Weight,
  calendar:        Calendar,
  refresh:         RefreshCw,
  eye:             Eye,
  "eye-off":       EyeOff,
  more:            MoreHorizontal,
  "arrow-left":    ArrowLeft,
  "arrow-right":   ArrowRight,
  menu:            Menu,
};

interface IconProps {
  name:       IconName;
  size?:      number;
  className?: string;
  "aria-hidden"?: boolean;
}

export function Icon({
  name,
  size      = 18,
  className,
  "aria-hidden": ariaHidden = true,
}: IconProps) {
  const LucideIcon = ICON_MAP[name];
  if (!LucideIcon) return null;

  return (
    <LucideIcon
      size={size}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}