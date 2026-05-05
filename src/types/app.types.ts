/**
 * GARBO — Application Types
 * UI-level types, API response shapes, form data, and component props.
 * Keep database types in database.types.ts; put everything app-specific here.
 */

import type {
  OperationStatus,
  IncidentType,
  AnnouncementType,
  ScheduleRow,
  SitioRow,
  OperationRow,
  IncidentRow,
  AnnouncementRow,
} from "./database.types";

// Re-export enums for convenience
export type { OperationStatus, IncidentType, AnnouncementType };

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id:        string;
  email:     string;
  full_name: string;
}

export interface LoginFormData {
  email:    string;
  password: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password:        string;
  confirmPassword: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API responses
// ─────────────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  string;
  message?:string;
}

export interface PaginatedResponse<T> {
  data:       T[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export interface DashboardKPIs {
  pendingRoutes:       number;
  completedToday:      number;
  delayedToday:        number;
  missedToday:         number;
  completionRate:      number;   // percentage 0–100
  totalWasteKg:        number;   // month-to-date
  totalFuelL:          number;   // month-to-date
  openIncidents:       number;
  activeAnnouncements: number;
  sitiosDeployed:      number;
}

export interface RecentActivity {
  id:          string;
  type:        "operation" | "incident" | "announcement";
  description: string;
  timestamp:   string;
  status?:     OperationStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedules
// ─────────────────────────────────────────────────────────────────────────────
// Schedule enriched with sitio name
export interface ScheduleWithSitio extends ScheduleRow {
  sitio: Pick<SitioRow, "id" | "name">;
}

export interface ScheduleFormData {
  sitio_id:        string;
  route_name:      string;
  collection_days: string[];
  frequency:       string;
  is_active:       boolean;
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

// Calendar view
export interface CalendarDay {
  date:       Date;
  isCurrentMonth: boolean;
  isToday:    boolean;
  routes:     ScheduleWithSitio[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Operations
// ─────────────────────────────────────────────────────────────────────────────
// Operation enriched with sitio + schedule names
export interface OperationWithDetails extends OperationRow {
  sitio:    Pick<SitioRow, "id" | "name">;
  schedule: Pick<ScheduleRow, "id" | "route_name" | "collection_days">;
}

export interface UpdateOperationData {
  status:          OperationStatus;
  fuel_consumed_l: number | null;
  waste_volume_kg: number | null;
  notes:           string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Incidents
// ─────────────────────────────────────────────────────────────────────────────
export interface IncidentWithSitio extends IncidentRow {
  sitio: Pick<SitioRow, "id" | "name">;
}

export interface IncidentFormData {
  sitio_id:             string;
  operation_id:         string | null;
  incident_type:        IncidentType;
  reason_tag:           string;
  location_description: string;
  incident_date:        string;
}

export const INCIDENT_REASON_TAGS: Record<IncidentType, string[]> = {
  "Missed Collection":  ["Breakdown", "Weather", "No Crew", "Road Block", "Other"],
  "Illegal Dumping":    ["Residential", "Commercial", "Roadside", "Waterway", "Other"],
  "Vehicle Breakdown":  ["Engine Failure", "Flat Tire", "Accident", "Other"],
  "Other":              ["Other"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Announcements
// ─────────────────────────────────────────────────────────────────────────────
export interface AnnouncementFormData {
  title:     string;
  body:      string;
  type:      AnnouncementType;
  is_active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────────────────────
export interface MonthlyReport {
  month:          string;  // "YYYY-MM"
  totalRoutes:    number;
  completed:      number;
  delayed:        number;
  missed:         number;
  completionRate: number;
  totalWasteKg:   number;
  totalFuelL:     number;
  incidentCount:  number;
  byWeek:         WeeklyBreakdown[];
  bySitio:        SitioBreakdown[];
}

export interface WeeklyBreakdown {
  weekStart:      string;
  completed:      number;
  delayed:        number;
  missed:         number;
  completionRate: number;
}

export interface SitioBreakdown {
  sitioId:        string;
  sitioName:      string;
  completed:      number;
  delayed:        number;
  missed:         number;
  completionRate: number;
  wasteKg:        number;
}

export type ExportFormat = "csv" | "pdf";

// ─────────────────────────────────────────────────────────────────────────────
// Filters
// ─────────────────────────────────────────────────────────────────────────────
export interface DateRangeFilter {
  from: string | null;  // ISO date "YYYY-MM-DD"
  to:   string | null;
}

export interface OperationFilters {
  dateRange:  DateRangeFilter;
  sitioId:    string | null;
  status:     OperationStatus | null;
}

export interface IncidentFilters {
  dateRange:     DateRangeFilter;
  sitioId:       string | null;
  incidentType:  IncidentType | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI State
// ─────────────────────────────────────────────────────────────────────────────
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface Toast {
  id:      string;
  type:    "success" | "error" | "warning" | "info";
  title:   string;
  message?:string;
}

export interface ModalState {
  isOpen:    boolean;
  type:      string | null;
  payload?:  unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────────
export interface NavItem {
  label:    string;
  href:     string;
  icon:     string;   // lucide icon name
  badge?:   number;   // notification count
}

// ─────────────────────────────────────────────────────────────────────────────
// Table / list helpers
// ─────────────────────────────────────────────────────────────────────────────
export interface SortConfig<T = string> {
  key:       T;
  direction: "asc" | "desc";
}

export interface TableColumn<T = Record<string, unknown>> {
  key:       keyof T | string;
  label:     string;
  sortable?: boolean;
  render?:   (value: unknown, row: T) => React.ReactNode;
  width?:    string;
}