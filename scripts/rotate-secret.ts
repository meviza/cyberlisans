#!/usr/bin/env node
/**
 * Secret rotation CLI.
 * Kullanım:
 *   tsx scripts/rotate-secret.ts <secret_name> <new_value> [--actor=admin:<uuid>]
 *
 * Mevcut desteklenen secret_name'ler:
 *   vercel_token, sentry_oauth_client_secret, sentry_personal_token,
 *   sentry_auth_token, trigger_dev_prod_secret, supabase_service_role,
 *   shopier_api_key, shopier_api_secret, shopier_merchant_id
 *
 * ⚠️ Yeni secret değerini shell history'e kaydetmemek için:
 *   export SHOPIER_API_KEY="new_value_here"
 *   tsx scripts/rotate-secret.ts shopier_api_key
 *
 * Eski değer Supabase Vault'ta encrypted kalır (audit log).
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(__dirname, '..');
if (existsSync(resolve(REPO_ROOT, 'apps/api/.env'))) {
  config({ path: resolve(REPO_ROOT, 'apps/api/.env') });
}

const ALLOWED = [
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

type SecretName = (typeof ALLOWED)[number];

async function main() {
  const [, , nameArg, valueArg] = process.argv;
  const actorArg = process.argv.find((a) => a.startsWith('--actor='))?.split('=')[1];

  if (!nameArg) {
    console.error('Usage: tsx scripts/rotate-secret.ts <secret_name> [value|--env]');
    console.error('Allowed:', ALLOWED.join(', '));
    process.exit(1);
  }

  if (!(ALLOWED as readonly string[]).includes(nameArg)) {
    console.error(`Unknown secret: ${nameArg}`);
    console.error('Allowed:', ALLOWED.join(', '));
    process.exit(1);
  }

  const name = nameArg as SecretName;

  let value = valueArg;
  if (!value || value === '--env') {
    const envName = name.toUpperCase();
    value = process.env[envName] || process.env[`ROTATE_${envName}`];
    if (!value) {
      console.error(`No value provided. Set ${envName} env or pass as argument.`);
      process.exit(1);
    }
    console.error(`(using value from env: ${envName})`);
  }

  const actor = actorArg || `cli:${process.env.USER || 'unknown'}`;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.rpc('set_app_secret', {
    p_name: name,
    p_value: value,
    p_actor: actor,
    p_metadata: {
      rotated_at: new Date().toISOString(),
      source: 'cli',
    },
  });

  if (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }

  console.log(`[ok] ${name} rotated by ${actor}`);
  console.log(`     timestamp: ${new Date().toISOString()}`);

  // Clear local cache (if API is running locally, it will re-fetch)
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
