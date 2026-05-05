/**
 * GARBO — Date Utilities
 * All dates are handled in Philippine Standard Time (UTC+8).
 * Uses the native Intl API — no heavy date library required.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
export const PH_TIMEZONE = "Asia/Manila";

export const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;

export const SHORT_MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
] as const;

export const DAY_NAMES = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Core helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the current date-time in Philippine Standard Time.
 */
export function nowPH(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: PH_TIMEZONE })
  );
}

/**
 * Returns an ISO date string "YYYY-MM-DD" for the current day in PH time.
 */
export function todayISO(): string {
  return toISODate(nowPH());
}

/**
 * Converts a Date to "YYYY-MM-DD" string (local, not UTC).
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parses "YYYY-MM-DD" to a local Date (avoids UTC offset issues).
 */
export function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number) as [number, number, number];
  return new Date(year, month - 1, day);
}

/**
 * Returns the day-of-week name for a given Date.
 * e.g. Monday, Tuesday...
 */
export function getDayName(date: Date): string {
  return DAY_NAMES[date.getDay()] ?? "";
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a date for display in the UI.
 * @example formatDate("2026-04-18") → "April 18, 2026"
 */
export function formatDate(isoDate: string): string {
  const date = parseISODate(isoDate);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Formats a date with day name.
 * @example formatDateWithDay("2026-04-18") → "Saturday, April 18, 2026"
 */
export function formatDateWithDay(isoDate: string): string {
  const date = parseISODate(isoDate);
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Short date format.
 * @example formatDateShort("2026-04-18") → "Apr 18, 2026"
 */
export function formatDateShort(isoDate: string): string {
  const date = parseISODate(isoDate);
  return `${SHORT_MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Month + Year header for calendar.
 * @example formatMonthYear(new Date(2026, 3, 1)) → "April 2026"
 */
export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Formats an ISO timestamp to a human-readable relative string.
 * @example formatRelative("2026-04-18T10:00:00Z") → "2 hours ago"
 */
export function formatRelative(isoTimestamp: string): string {
  const then = new Date(isoTimestamp);
  const now  = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)  return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(isoTimestamp.split("T")[0] ?? "");
}

/**
 * Formats a time from an ISO timestamp.
 * @example formatTime("2026-04-18T14:30:00+08:00") → "2:30 PM"
 */
export function formatTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString("en-PH", {
    timeZone: PH_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the first and last ISO date strings for a given month.
 */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month, 1);
  const end   = new Date(year, month + 1, 0);  // last day of month
  return { start: toISODate(start), end: toISODate(end) };
}

/**
 * Generates a 6-week grid of dates for a calendar view.
 * Always starts on Sunday, covers the full month plus padding days.
 */
export function buildCalendarGrid(year: number, month: number): Date[] {
  const firstDay   = new Date(year, month, 1);
  const startIndex = firstDay.getDay();  // 0=Sun, 6=Sat
  const grid: Date[] = [];

  // Pad from previous month
  for (let i = startIndex - 1; i >= 0; i--) {
    grid.push(new Date(year, month, -i));
  }

  // Current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month, d));
  }

  // Pad to fill 6 rows (42 cells)
  while (grid.length < 42) {
    const last = grid[grid.length - 1]!;
    grid.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }

  return grid;
}

/**
 * Checks if a schedule's collection_days includes the given date's day.
 * @param collectionDays ["Monday","Thursday"]
 * @param date           the date to check
 */
export function scheduleRunsOnDate(collectionDays: string[], date: Date): boolean {
  const dayName = getDayName(date);
  return collectionDays.includes(dayName);
}

// ─────────────────────────────────────────────────────────────────────────────
// Range helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if isoDate falls within the given range (inclusive).
 */
export function isInRange(isoDate: string, from: string | null, to: string | null): boolean {
  if (!from && !to) return true;
  const d = isoDate;
  if (from && d < from) return false;
  if (to   && d > to)   return false;
  return true;
}

/**
 * Returns ISO date strings for the current month's start and end.
 */
export function currentMonthRange(): { start: string; end: string } {
  const now = nowPH();
  return getMonthRange(now.getFullYear(), now.getMonth());
}

/**
 * Returns the ISO date string for N days ago.
 */
export function daysAgoISO(n: number): string {
  const d = nowPH();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the string is a valid ISO date "YYYY-MM-DD".
 */
export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseISODate(value);
  return !isNaN(d.getTime());
}