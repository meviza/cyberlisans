-- ============================================
-- 0013_fix_pgsodium_random.sql
-- M5.1 fix: use pgsodium.randombytes_buf(n) instead of gen_random_bytes
-- (later replaced with pgcrypto in 0014)
-- ============================================

DROP FUNCTION IF EXISTS public.set_app_secret(TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.get_app_secret(TEXT);

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
  v_nonce BYTEA;
BEGIN
  v_nonce := pgsodium.randombytes_buf(24);

  UPDATE public.app_secrets
    SET encrypted_value = pgsodium.crypto_aead_det_encrypt(
         convert_to(p_value, 'utf8'),
         convert_to(p_name, 'utf8'),
         v_nonce,
         NULL
       ),
       nonce = v_nonce,
       rotation_count = COALESCE(rotation_count, 0) + 1,
       last_rotated_at = now(),
       last_rotated_by = p_actor,
       metadata = metadata || p_metadata,
       updated_at = now()
   WHERE name = p_name
   RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    INSERT INTO public.app_secrets (
      name, encrypted_value, nonce, last_rotated_by, metadata
    ) VALUES (
      p_name,
      pgsodium.crypto_aead_det_encrypt(
        convert_to(p_value, 'utf8'),
        convert_to(p_name, 'utf8'),
        v_nonce,
        NULL
      ),
      v_nonce,
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
  v_nonce BYTEA;
BEGIN
  SELECT encrypted_value, nonce
    INTO v_value, v_nonce
    FROM public.app_secrets
   WHERE name = p_name;

  IF v_value IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN convert_from(
    pgsodium.crypto_aead_det_decrypt(
      v_value,
      convert_to(p_name, 'utf8'),
      v_nonce,
      NULL
    ),
    'utf8'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_app_secret(TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_app_secret(TEXT) TO service_role;
REVOKE EXECUTE ON FUNCTION public.set_app_secret(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_app_secret(TEXT) FROM PUBLIC;

COMMENT ON FUNCTION public.set_app_secret IS 'M5.1: pgsodium XChaCha20-Poly1305 encrypted secret setter (service_role only)';
COMMENT ON FUNCTION public.get_app_secret IS 'M5.1: pgsodium XChaCha20-Poly1305 encrypted secret getter (service_role only)';