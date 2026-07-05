-- ============================================
-- 0015_pgcrypto_schema_fix.sql
-- M5.1 fix: digest() lives in extensions schema, not public
-- ============================================

DROP FUNCTION IF EXISTS public.derive_secret_key(TEXT);
DROP FUNCTION IF EXISTS public.set_app_secret(TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.get_app_secret(TEXT);

CREATE OR REPLACE FUNCTION public.derive_secret_key(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT encode(
    extensions.digest(
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
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_id UUID;
  v_existing_id UUID;
  v_key TEXT;
  v_is_new BOOLEAN := false;
BEGIN
  v_key := public.derive_secret_key(p_name);

  SELECT id INTO v_existing_id FROM public.app_secrets WHERE name = p_name;
  v_is_new := v_existing_id IS NULL;

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
    CASE WHEN v_is_new THEN 'CREATED' ELSE 'ROTATED' END,
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
SET search_path TO 'public', 'extensions', 'pg_temp'
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