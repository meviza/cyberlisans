-- ============================================
-- 0018_app_secrets_camelcase_col.sql
-- M5.1 fix: touch_updated_at trigger sets NEW."updatedAt"
-- but app_secrets has updated_at (snake_case).
-- ============================================

ALTER TABLE public.app_secrets ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_touch_app_secrets ON public.app_secrets;