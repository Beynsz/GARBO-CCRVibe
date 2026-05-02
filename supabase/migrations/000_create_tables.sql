-- ============================================================================
-- GARBO — Table Definitions
-- Run this FIRST before 001_garbo_schema.sql
-- SDD §5.1 — Data Schema
-- ============================================================================

-- ── Enable UUID extension ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── admins ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admins (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  full_name     TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

-- ── sitios ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sitios (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── master_schedules ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.master_schedules (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sitio_id        UUID        NOT NULL REFERENCES public.sitios(id) ON DELETE CASCADE,
  route_name      TEXT        NOT NULL,
  collection_days TEXT[]      NOT NULL DEFAULT '{}',
  frequency       TEXT        NOT NULL DEFAULT 'Weekly',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_schedules_sitio    ON public.master_schedules(sitio_id);
CREATE INDEX IF NOT EXISTS idx_schedules_active   ON public.master_schedules(is_active);

-- ── daily_operations ─────────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS operation_status_enum AS ENUM (
  'Pending', 'Completed', 'Delayed', 'Missed'
);

CREATE TABLE IF NOT EXISTS public.daily_operations (
  id               UUID                   PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id      UUID                   NOT NULL REFERENCES public.master_schedules(id) ON DELETE CASCADE,
  sitio_id         UUID                   NOT NULL REFERENCES public.sitios(id) ON DELETE CASCADE,
  operation_date   DATE                   NOT NULL,
  status           operation_status_enum  NOT NULL DEFAULT 'Pending',
  fuel_consumed_l  FLOAT,
  waste_volume_kg  FLOAT,
  notes            TEXT,
  updated_by       UUID                   REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at       TIMESTAMPTZ,
  CONSTRAINT uq_daily_ops_schedule_date UNIQUE (schedule_id, operation_date)
);

CREATE INDEX IF NOT EXISTS idx_ops_date    ON public.daily_operations(operation_date);
CREATE INDEX IF NOT EXISTS idx_ops_status  ON public.daily_operations(status);
CREATE INDEX IF NOT EXISTS idx_ops_sitio   ON public.daily_operations(sitio_id);

-- ── incidents ────────────────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS incident_type_enum AS ENUM (
  'Missed Collection', 'Illegal Dumping', 'Vehicle Breakdown', 'Other'
);

CREATE TABLE IF NOT EXISTS public.incidents (
  id                    UUID                 PRIMARY KEY DEFAULT uuid_generate_v4(),
  sitio_id              UUID                 NOT NULL REFERENCES public.sitios(id) ON DELETE CASCADE,
  operation_id          UUID                 REFERENCES public.daily_operations(id) ON DELETE SET NULL,
  incident_type         incident_type_enum   NOT NULL,
  reason_tag            TEXT                 NOT NULL,
  location_description  TEXT,
  incident_date         DATE                 NOT NULL,
  logged_by             UUID                 NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_date   ON public.incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_incidents_sitio  ON public.incidents(sitio_id);
CREATE INDEX IF NOT EXISTS idx_incidents_type   ON public.incidents(incident_type);

-- ── announcements ────────────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS announcement_type_enum AS ENUM (
  'Weather Delay', 'Reminder', 'Notice', 'Cancellation', 'Other'
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID                      PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT                      NOT NULL,
  body        TEXT                      NOT NULL,
  type        announcement_type_enum    NOT NULL DEFAULT 'Notice',
  is_active   BOOLEAN                   NOT NULL DEFAULT TRUE,
  created_by  UUID                      NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active);

-- ── Seed: example Sitios for Barangay Banilad ────────────────────────────────
INSERT INTO public.sitios (name, description) VALUES
  ('Sitio Mahiga',   'Northern zone near the river'),
  ('Sitio Bukid',    'Agricultural area, eastern side'),
  ('Sitio Pahina',   'Central residential cluster'),
  ('Sitio Tubod',    'Near the main water source'),
  ('Sitio Cambinocot','Southern residential area')
ON CONFLICT (name) DO NOTHING;