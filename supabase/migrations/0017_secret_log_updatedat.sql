-- ============================================
-- 0017_secret_log_updatedat.sql
-- M5.1 fix: add updatedAt column to satisfy PostgREST auto-select
-- (PostgREST auto-adds updatedAt to INSERT payloads when column exists)
-- ============================================

ALTER TABLE public.secret_rotation_log ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now();

COMMENT ON COLUMN public.secret_rotation_log."updatedAt" IS 'M5.1: added to satisfy Supabase PostgREST auto-select behavior';