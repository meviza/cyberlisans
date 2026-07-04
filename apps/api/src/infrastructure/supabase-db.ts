import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _anon: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

function readUrl(): string {
  return process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL'] || '';
}

function readAnonKey(): string {
  return (
    process.env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] ||
    process.env['SUPABASE_ANON_KEY'] ||
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
    ''
  );
}

export function supabase(): SupabaseClient {
  if (_anon) return _anon;
  const url = readUrl();
  const key = readAnonKey();
  if (!url || !key) throw new Error('Supabase anon env missing');
  _anon = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _anon;
}

export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = readUrl();
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['SUPABASE_SECRET_KEY'] || '';
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY required for admin');
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

export function dbError(err: { message?: string; code?: string } | null): Error {
  if (!err) return new Error('DB_ERROR');
  const e = new Error(err.message || 'DB_ERROR');
  (e as Error & { code?: string }).code = err.code;
  return e;
}
