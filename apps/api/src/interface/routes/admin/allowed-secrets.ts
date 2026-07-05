export const ALLOWED_SECRET_NAMES = [
  'vercel_token',
  'sentry_oauth_client_secret',
  'sentry_personal_token',
  'sentry_auth_token',
  'trigger_dev_prod_secret',
  'supabase_service_role',
  'shopier_api_key',
  'shopier_api_secret',
  'shopier_merchant_id',
] as const;

export type AllowedSecretName = (typeof ALLOWED_SECRET_NAMES)[number];
