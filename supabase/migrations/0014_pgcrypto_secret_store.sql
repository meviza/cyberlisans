-- ============================================
-- 0014_pgcrypto_secret_store.sql
-- M5.1 fix: replace pgsodium with pgcrypto AES-256
-- Reason: pgsodium.randombytes_buf requires pgsodium role permissions;
--          SECURIY DEFINER with service_role caller fails on Supabase managed.
-- ============================================

DROP FUNCTION IF EXISTS public.set_app_secret(TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.get_app_secret(TEXT);

CREATE OR REPLACE FUNCTION public.derive_secret_key(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT encode(
    digest(
      p_name || ':' || 'cyberlisans-m5-1-vault-salt-2026',
      'sha256'
    ),
    'hex'
  )
$$;

CREATE OR REPLACE FUNCTION public.set_app_secret(
  p_name TEXT,
  p_value TEXT,
  p_actor TEXT DEFAULT 'service_role',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id UUID;
  v_existing_id UUID;
  v_key TEXT;
BEGIN
  v_key := public.derive_secret_key(p_name);

  SELECT id INTO v_existing_id FROM public.app_secrets WHERE name = p_name;

  UPDATE public.app_secrets
    SET encrypted_value = pgp_sym_encrypt(p_value, v_key, 'cipher-algo=aes256'),
       rotation_count = COALESCE(rotation_count, 0) + 1,
       last_rotated_at = now(),
       last_rotated_by = p_actor,
       metadata = metadata || p_metadata,
       updated_at = now()
   WHERE name = p_name
   RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    INSERT INTO public.app_secrets (
      name, encrypted_value, last_rotated_by, metadata
    ) VALUES (
      p_name,
      pgp_sym_encrypt(p_value, v_key, 'cipher-algo=aes256'),
      p_actor,
      p_metadata
    )
    RETURNING id INTO v_id;
  END IF;

  INSERT INTO public.secret_rotation_log (secret_name, action, actor, metadata)
  VALUES (
    p_name,
    CASE WHEN v_existing_id IS NULL THEN 'CREATED' ELSE 'ROTATED' END,
    p_actor,
    p_metadata
  );

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_app_secret(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_value BYTEA;
  v_key TEXT;
BEGIN
  SELECT encrypted_value INTO v_value
    FROM public.app_secrets
   WHERE name = p_name;

  IF v_value IS NULL THEN
    RETURN NULL;
  END IF;

  v_key := public.derive_secret_key(p_name);

  RETURN pgp_sym_decrypt(v_value, v_key);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_app_secret(TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_app_secret(TEXT) TO service_role;
REVOKE EXECUTE ON FUNCTION public.set_app_secret(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_app_secret(TEXT) FROM PUBLIC;

COMMENT ON FUNCTION public.set_app_secret IS 'M5.1: pgcrypto AES-256 encrypted secret setter (service_role only)';
COMMENT ON FUNCTION public.get_app_secret IS 'M5.1: pgcrypto AES-256 encrypted secret getter (service_role only)';

-- Drop pgsodium (no longer needed)
DROP EXTENSION IF EXISTS pgsodium;