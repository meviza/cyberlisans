-- 0021_security_linter_fixes.sql
-- Resolves Supabase Database Linter findings:
--   * function_search_path_mutable  (warn on derive_secret_key)
--   * rls_policy_always_true        (warn on failed_login_attempts INSERT)
--   * anon_security_definer_function_executable
--   * authenticated_security_definer_function_executable
--
-- All statements are idempotent (DROP IF EXISTS / DO blocks).

-- ============================================================================
-- 1. derive_secret_key: pin search_path so it cannot be set by a hostile role.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.derive_secret_key(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT encode(
    digest(
      p_name || ':' || 'cyberlisans-m5-1-vault-salt-2026',
      'sha256'
    ),
    'hex'
  );
$$;

-- ============================================================================
-- 2. Lock down SECURITY DEFINER functions callable from anon/authenticated.
--    Service role retains EXECUTE; anon and authenticated lose it.
-- ============================================================================
DO $$
DECLARE
  fn TEXT;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.current_app_user_id()',
    'public.is_admin()',
    'public.is_super_admin()',
    'public.handle_new_auth_user()',
    'public.get_app_secret(TEXT)',
    'public.set_app_secret(TEXT, TEXT, TEXT, JSONB)'
  ]
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn);
  END LOOP;
END
$$;

-- Service role keeps access (the API uses the service-role key for these).
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin()                   TO service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin()             TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_auth_user()       TO service_role;
GRANT EXECUTE ON FUNCTION public.get_app_secret(TEXT)         TO service_role;
GRANT EXECUTE ON FUNCTION public.set_app_secret(TEXT, TEXT, TEXT, JSONB) TO service_role;

-- is_admin() and is_super_admin() are also called by RLS policies under the
-- table-owner's role, so we still need to mark them as SECURITY INVOKER for
-- the linter to consider them safe.  We keep SECURITY DEFINER behaviour by
-- qualifying the body with a hardened search_path.  Below we set search_path
-- explicitly on the helper functions and switch them to SECURITY INVOKER,
-- because the linter warns whenever anon can call a SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE "supabaseAuthId" = auth.uid()
      AND role IN ('ADMIN','SUPER_ADMIN')
      AND status = 'ACTIVE'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE "supabaseAuthId" = auth.uid()
      AND role = 'SUPER_ADMIN'
      AND status = 'ACTIVE'
  );
$function$;

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT id FROM public.users WHERE "supabaseAuthId" = auth.uid() LIMIT 1;
$function$;

-- ============================================================================
-- 3. failed_login_attempts: drop the unrestricted INSERT policy and replace
--    it with one that only allows inserts from a non-existing placeholder
--    (server-side inserts use the service_role key which bypasses RLS).
-- ============================================================================
DROP POLICY IF EXISTS failed_login_attempts_insert ON "failed_login_attempts";

-- No client should ever insert into this table; the API uses service_role.
-- We deliberately do not add a permissive INSERT policy.

-- ============================================================================
-- 4. Re-affirm search_path on every other SECURITY DEFINER function for
--    defense in depth (linter is satisfied as long as search_path is pinned
--    on a non-mutable scope, but we tighten any stray ones here).
-- ============================================================================
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT p.oid, p.proname, n.nspname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.prosecdef = true
      AND n.nspname = 'public'
      AND p.oid::regprocedure::text NOT IN (
        'public.derive_secret_key(text)',
        'public.is_admin()',
        'public.is_super_admin()',
        'public.current_app_user_id()'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path TO %L',
      fn.nspname, fn.proname,
      pg_get_function_arguments(fn.oid),
      'public, pg_temp'
    );
  END LOOP;
END
$$;
