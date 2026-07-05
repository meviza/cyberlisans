-- ============================================
-- 0012_supabase_vault.sql
-- M5.1: Supabase pgsodium-based encrypted secret store
-- (later replaced with pgcrypto in 0014/0015 due to permission issues)
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgsodium;

CREATE TABLE IF NOT EXISTS public.app_secrets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT UNIQUE NOT NULL,
  encrypted_value BYTEA NOT NULL,
  nonce           BYTEA,
  key_id          TEXT,
  rotation_count  INTEGER NOT NULL DEFAULT 0,
  last_rotated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_rotated_by TEXT,
  expires_at      TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_secrets_name ON public.app_secrets(name);
CREATE INDEX IF NOT EXISTS idx_app_secrets_last_rotated_at ON public.app_secrets(last_rotated_at DESC);

CREATE TABLE IF NOT EXISTS public.secret_rotation_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_name  TEXT NOT NULL,
  action       TEXT NOT NULL CHECK (action IN ('CREATED','ROTATED','DELETED','READ')),
  actor        TEXT NOT NULL,
  actor_id     UUID,
  ip_address   INET,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_secret_rotation_log_name ON public.secret_rotation_log(secret_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_secret_rotation_log_actor ON public.secret_rotation_log(actor, created_at DESC);

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_rotation_log ENABLE ROW LEVEL SECURITY;

-- service_role only; admins never read raw ciphertext via PostgREST
DROP POLICY IF EXISTS app_secrets_service_role_all ON public.app_secrets;
CREATE POLICY app_secrets_service_role_all
  ON public.app_secrets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS secret_rotation_log_service_role_all ON public.secret_rotation_log;
CREATE POLICY secret_rotation_log_service_role_all
  ON public.secret_rotation_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.app_secrets IS 'M5.1: AES-256 encrypted secrets store (Supabase Vault). service_role only via RPC.';
COMMENT ON TABLE public.secret_rotation_log IS 'M5.1: append-only audit trail for secret access/rotation events.';