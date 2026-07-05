import { supabaseAdmin } from '../infrastructure/supabase-db';

export type SecretName =
  | 'vercel_token'
  | 'sentry_oauth_client_secret'
  | 'sentry_personal_token'
  | 'sentry_auth_token'
  | 'trigger_dev_prod_secret'
  | 'supabase_service_role'
  | 'shopier_api_key'
  | 'shopier_api_secret'
  | 'shopier_merchant_id';

const CACHE_TTL_MS = 60_000; // 60s cache
const cache = new Map<string, { value: string; expiresAt: number }>();

export async function getSecret(name: SecretName): Promise<string | null> {
  const cached = cache.get(name);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const envValue = process.env[name.toUpperCase()];
  if (envValue) {
    cache.set(name, { value: envValue, expiresAt: Date.now() + CACHE_TTL_MS });
    return envValue;
  }

  try {
    const { data, error } = await supabaseAdmin().rpc('get_app_secret', { p_name: name });
    if (error || !data) return null;
    cache.set(name, { value: data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  } catch {
    return null;
  }
}

export async function setSecret(
  name: SecretName,
  value: string,
  actor = 'service_role',
  metadata: Record<string, unknown> = {},
): Promise<boolean> {
  cache.delete(name);
  const { error } = await supabaseAdmin().rpc('set_app_secret', {
    p_name: name,
    p_value: value,
    p_actor: actor,
    p_metadata: metadata,
  });
  return !error;
}

export async function rotateSecret(
  name: SecretName,
  newValue: string,
  actor = 'service_role',
): Promise<boolean> {
  return setSecret(name, newValue, actor, { rotated_at: new Date().toISOString() });
}

export function clearSecretCache(name?: SecretName): void {
  if (name) cache.delete(name);
  else cache.clear();
}
