-- ============================================================================
-- GARBO — Supabase Database Functions & Cron Setup
-- SRS §3.4.3.1 — Auto-generate daily task lists at 00:00 based on Master Schedule
--
-- Run this SQL in Supabase Dashboard → SQL Editor to set up:
--   1. generate_daily_operations() — RPC function
--   2. pg_cron job — fires at 00:00 Philippine Standard Time (UTC+8 = 16:00 UTC)
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. FUNCTION: generate_daily_operations
--    Called by cron AND by admins from the UI (manual backfill).
--    Inserts Pending operations for all active schedules that run on target_date.
--    Uses ON CONFLICT DO NOTHING so it is idempotent (safe to call twice).
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_daily_operations(target_date DATE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER   -- runs as the function owner, bypassing RLS for inserts
SET search_path = public
AS $$
DECLARE
  v_day_name    TEXT;
  v_inserted    INT := 0;
  v_schedule    RECORD;
BEGIN
  -- Derive the day-of-week name for target_date
  -- to_char returns 'Monday', 'Tuesday', etc. — matches collection_days values
  v_day_name := to_char(target_date, 'FMDay');  -- 'FMDay' = no trailing spaces

  -- Loop over every active schedule that runs on this day
  FOR v_schedule IN
    SELECT id, sitio_id
    FROM   public.master_schedules
    WHERE  is_active = TRUE
      AND  collection_days @> ARRAY[v_day_name]   -- array contains
  LOOP
    -- Insert with ON CONFLICT to make this idempotent
    INSERT INTO public.daily_operations
      (schedule_id, sitio_id, operation_date, status)
    VALUES
      (v_schedule.id, v_schedule.sitio_id, target_date, 'Pending')
    ON CONFLICT (schedule_id, operation_date) DO NOTHING;

    -- Count only actual inserts (pg doesn't return inserted count with DO NOTHING easily)
    -- Use GET DIAGNOSTICS instead
    IF FOUND THEN
      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  RETURN json_build_object('created_count', v_inserted, 'date', target_date);
END;
$$;

-- Grant execute to authenticated users so the frontend can call it via RPC
GRANT EXECUTE ON FUNCTION public.generate_daily_operations(DATE)
  TO authenticated;


-- ────────────────────────────────────────────────────────────────────────────
-- 2. UNIQUE CONSTRAINT on daily_operations
--    Prevents duplicate records for the same schedule + date.
--    Required for the ON CONFLICT clause above.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.daily_operations
  ADD CONSTRAINT IF NOT EXISTS uq_daily_ops_schedule_date
  UNIQUE (schedule_id, operation_date);


-- ────────────────────────────────────────────────────────────────────────────
-- 3. CRON JOB via pg_cron (must be enabled in Supabase Extensions)
--    Fires at 16:00 UTC = 00:00 Philippine Standard Time (UTC+8)
--    Run this after enabling the pg_cron extension in Supabase Dashboard.
-- ────────────────────────────────────────────────────────────────────────────
-- Enable extension first (run in SQL editor):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'generate-daily-ops-midnight-ph',          -- job name (unique)
  '0 16 * * *',                              -- 16:00 UTC = 00:00 PHT
  $$
    SELECT public.generate_daily_operations(
      (NOW() AT TIME ZONE 'Asia/Manila')::DATE
    );
  $$
);


-- ────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY policies for all tables
--    SRS §3.5.1 — Restrict database write-access to authenticated Admins only.
-- ────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all GARBO tables
ALTER TABLE public.admins            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_schedules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_operations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements     ENABLE ROW LEVEL SECURITY;

-- ── admins: only the user themselves can read their own row ──────────────────
CREATE POLICY "admins: own row" ON public.admins
  FOR ALL USING (auth.uid() = id);

-- ── sitios: authenticated users can read; only admins can write ─────────────
CREATE POLICY "sitios: authenticated read" ON public.sitios
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "sitios: authenticated write" ON public.sitios
  FOR ALL USING (auth.role() = 'authenticated');

-- ── master_schedules ─────────────────────────────────────────────────────────
CREATE POLICY "schedules: authenticated read" ON public.master_schedules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "schedules: authenticated write" ON public.master_schedules
  FOR ALL USING (auth.role() = 'authenticated');

-- ── daily_operations ─────────────────────────────────────────────────────────
CREATE POLICY "ops: authenticated read" ON public.daily_operations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ops: authenticated write" ON public.daily_operations
  FOR ALL USING (auth.role() = 'authenticated');

-- ── incidents ────────────────────────────────────────────────────────────────
CREATE POLICY "incidents: authenticated read" ON public.incidents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "incidents: authenticated write" ON public.incidents
  FOR ALL USING (auth.role() = 'authenticated');

-- ── announcements ────────────────────────────────────────────────────────────
CREATE POLICY "announcements: authenticated read" ON public.announcements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "announcements: authenticated write" ON public.announcements
  FOR ALL USING (auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────────────────────
-- 5. DAILY SUMMARY VIEW
--    Used by Dashboard KPIs and Reports page.
--    SDD §5.1 — daily_summary view.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.daily_summary AS
SELECT
  operation_date,
  COUNT(*)                                               AS total_routes,
  COUNT(*) FILTER (WHERE status = 'Completed')           AS completed,
  COUNT(*) FILTER (WHERE status = 'Delayed')             AS delayed,
  COUNT(*) FILTER (WHERE status = 'Missed')              AS missed,
  COUNT(*) FILTER (WHERE status = 'Pending')             AS pending,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'Completed')::NUMERIC
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                      AS completion_rate,
  COALESCE(SUM(waste_volume_kg), 0)                      AS total_waste_kg,
  COALESCE(SUM(fuel_consumed_l), 0)                      AS total_fuel_l
FROM public.daily_operations
GROUP BY operation_date
ORDER BY operation_date DESC;