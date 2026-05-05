/**
 * GARBO — Database Types
 * Mirrors the PostgreSQL schema defined in SDD §5.1.
 * In production, regenerate this file with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─────────────────────────────────────────────────────────────────────────────
// Database schema
// ─────────────────────────────────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      // ── admins ─────────────────────────────────────────────────────────────
      admins: {
        Row: {
          id:            string;        // uuid PK
          email:         string;
          password_hash: string;
          full_name:     string;
          created_at:    string;        // ISO-8601 timestamp
          last_login:    string | null;
        };
        Insert: {
          id?:           string;
          email:         string;
          password_hash: string;
          full_name:     string;
          created_at?:   string;
          last_login?:   string | null;
        };
        Update: {
          id?:           string;
          email?:        string;
          password_hash?:string;
          full_name?:    string;
          created_at?:   string;
          last_login?:   string | null;
        };
      };

      // ── sitios ─────────────────────────────────────────────────────────────
      sitios: {
        Row: {
          id:          string;          // uuid PK
          name:        string;          // e.g. "Sitio Mahiga"
          description: string | null;
          created_at:  string;
        };
        Insert: {
          id?:         string;
          name:        string;
          description?:string | null;
          created_at?: string;
        };
        Update: {
          id?:         string;
          name?:       string;
          description?:string | null;
          created_at?: string;
        };
      };

      // ── master_schedules ───────────────────────────────────────────────────
      master_schedules: {
        Row: {
          id:              string;      // uuid PK
          sitio_id:        string;      // FK → sitios.id
          route_name:      string;
          collection_days: string[];    // e.g. ["Monday","Thursday"]
          frequency:       string;      // e.g. "Bi-weekly"
          is_active:       boolean;
          created_at:      string;
          created_by:      string;      // FK → admins.id
        };
        Insert: {
          id?:             string;
          sitio_id:        string;
          route_name:      string;
          collection_days: string[];
          frequency?:      string;
          is_active?:      boolean;
          created_at?:     string;
          created_by:      string;
        };
        Update: {
          id?:             string;
          sitio_id?:       string;
          route_name?:     string;
          collection_days?:string[];
          frequency?:      string;
          is_active?:      boolean;
          created_at?:     string;
          created_by?:     string;
        };
      };

      // ── daily_operations ───────────────────────────────────────────────────
      daily_operations: {
        Row: {
          id:               string;    // uuid PK
          schedule_id:      string;    // FK → master_schedules.id
          sitio_id:         string;    // FK → sitios.id
          operation_date:   string;    // ISO date "YYYY-MM-DD"
          status:           OperationStatus;
          fuel_consumed_l:  number | null;  // litres
          waste_volume_kg:  number | null;  // kilograms
          notes:            string | null;
          updated_by:       string | null;  // FK → admins.id
          updated_at:       string | null;
        };
        Insert: {
          id?:              string;
          schedule_id:      string;
          sitio_id:         string;
          operation_date:   string;
          status?:          OperationStatus;
          fuel_consumed_l?: number | null;
          waste_volume_kg?: number | null;
          notes?:           string | null;
          updated_by?:      string | null;
          updated_at?:      string | null;
        };
        Update: {
          id?:              string;
          schedule_id?:     string;
          sitio_id?:        string;
          operation_date?:  string;
          status?:          OperationStatus;
          fuel_consumed_l?: number | null;
          waste_volume_kg?: number | null;
          notes?:           string | null;
          updated_by?:      string | null;
          updated_at?:      string | null;
        };
      };

      // ── incidents ─────────────────────────────────────────────────────────
      incidents: {
        Row: {
          id:                   string;   // uuid PK
          sitio_id:             string;   // FK → sitios.id
          operation_id:         string | null; // FK → daily_operations.id
          incident_type:        IncidentType;
          reason_tag:           string;   // e.g. "Breakdown", "Weather"
          location_description: string | null;
          incident_date:        string;   // ISO date
          logged_by:            string;   // FK → admins.id
          created_at:           string;
        };
        Insert: {
          id?:                  string;
          sitio_id:             string;
          operation_id?:        string | null;
          incident_type:        IncidentType;
          reason_tag:           string;
          location_description?:string | null;
          incident_date:        string;
          logged_by:            string;
          created_at?:          string;
        };
        Update: {
          id?:                  string;
          sitio_id?:            string;
          operation_id?:        string | null;
          incident_type?:       IncidentType;
          reason_tag?:          string;
          location_description?:string | null;
          incident_date?:       string;
          logged_by?:           string;
          created_at?:          string;
        };
      };

      // ── announcements ─────────────────────────────────────────────────────
      announcements: {
        Row: {
          id:         string;   // uuid PK
          title:      string;
          body:       string;
          type:       AnnouncementType;
          is_active:  boolean;
          created_by: string;   // FK → admins.id
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?:        string;
          title:      string;
          body:       string;
          type?:      AnnouncementType;
          is_active?: boolean;
          created_by: string;
          created_at?:string;
          updated_at?:string | null;
        };
        Update: {
          id?:        string;
          title?:     string;
          body?:      string;
          type?:      AnnouncementType;
          is_active?: boolean;
          created_by?:string;
          created_at?:string;
          updated_at?:string | null;
        };
      };
    };

    Views: {
      // Aggregate view used by Dashboard KPIs and Reports
      daily_summary: {
        Row: {
          operation_date:    string;
          total_routes:      number;
          completed:         number;
          delayed:           number;
          missed:            number;
          pending:           number;
          completion_rate:   number;   // 0–100
          total_waste_kg:    number;
          total_fuel_l:      number;
        };
      };
    };

    Functions: {
      // Edge function: auto-generates daily_operations from master_schedules
      generate_daily_operations: {
        Args:    { target_date: string };
        Returns: { created_count: number };
      };
    };

    Enums: {
      operation_status:  OperationStatus;
      incident_type:     IncidentType;
      announcement_type: AnnouncementType;
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Enum types
// ─────────────────────────────────────────────────────────────────────────────
export type OperationStatus =
  | "Pending"
  | "Completed"
  | "Delayed"
  | "Missed";

export type IncidentType =
  | "Missed Collection"
  | "Illegal Dumping"
  | "Vehicle Breakdown"
  | "Other";

export type AnnouncementType =
  | "Weather Delay"
  | "Reminder"
  | "Notice"
  | "Cancellation"
  | "Other";

// ─────────────────────────────────────────────────────────────────────────────
// Convenience row shortcuts
// ─────────────────────────────────────────────────────────────────────────────
export type AdminRow           = Database["public"]["Tables"]["admins"]["Row"];
export type SitioRow           = Database["public"]["Tables"]["sitios"]["Row"];
export type ScheduleRow        = Database["public"]["Tables"]["master_schedules"]["Row"];
export type OperationRow       = Database["public"]["Tables"]["daily_operations"]["Row"];
export type IncidentRow        = Database["public"]["Tables"]["incidents"]["Row"];
export type AnnouncementRow    = Database["public"]["Tables"]["announcements"]["Row"];
export type DailySummaryRow    = Database["public"]["Views"]["daily_summary"]["Row"];