import { supabaseAdmin, dbError } from '../../infrastructure/db';
import { AccountLockedError } from '../errors';

const TIER_1 = 5;
const TIER_1_LOCK_MS = 15 * 60_000;
const TIER_2 = 10;
const TIER_2_LOCK_MS = 60 * 60_000;
const TIER_3 = 20;
const TIER_3_LOCK_MS = 24 * 60 * 60_000;

interface AttemptTracker {
  count: number;
  firstAt: number;
  lockedUntil?: number;
}

const trackers = new Map<string, AttemptTracker>();

const GC_INTERVAL = 5 * 60_000;
let gcHandle: NodeJS.Timeout | null = null;

if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'test') {
  gcHandle = setInterval(() => {
    const now = Date.now();
    for (const [k, t] of trackers) {
      const expiry = t.lockedUntil ?? t.firstAt + TIER_3_LOCK_MS;
      if (expiry < now) trackers.delete(k);
    }
  }, GC_INTERVAL);
  gcHandle.unref?.();
}

function trackerKey(email: string): string {
  return email.toLowerCase().trim();
}

export interface LockoutInfo {
  locked: boolean;
  attempts: number;
  lockedUntil?: Date;
  retryAfterSeconds?: number;
}

type AttemptRow = {
  email: string;
  attemptedAt: string;
  lockedUntil: string | null;
};

export async function getLockoutInfo(email: string): Promise<LockoutInfo> {
  const key = trackerKey(email);
  const tracker = trackers.get(key);
  if (tracker?.lockedUntil && tracker.lockedUntil > Date.now()) {
    return {
      locked: true,
      attempts: tracker.count,
      lockedUntil: new Date(tracker.lockedUntil),
      retryAfterSeconds: Math.ceil((tracker.lockedUntil - Date.now()) / 1000),
    };
  }
  if (tracker?.lockedUntil && tracker.lockedUntil <= Date.now()) {
    trackers.delete(key);
  }
  try {
    const since = new Date(Date.now() - TIER_3_LOCK_MS).toISOString();
    const { data: recent, error } = await supabaseAdmin()
      .from('failed_login_attempts')
      .select('email,attemptedAt,lockedUntil')
      .eq('email', key)
      .gte('attemptedAt', since)
      .order('attemptedAt', { ascending: true });
    if (error) throw dbError(error);
    const rows = (recent ?? []) as AttemptRow[];
    const nowDate = new Date();
    const active = rows.filter((r) => !r.lockedUntil || new Date(r.lockedUntil) > nowDate);
    const activeLock = active.find((r) => r.lockedUntil && new Date(r.lockedUntil) > nowDate);
    if (activeLock && activeLock.lockedUntil) {
      const until = new Date(activeLock.lockedUntil);
      return {
        locked: true,
        attempts: active.length,
        lockedUntil: until,
        retryAfterSeconds: Math.ceil((until.getTime() - Date.now()) / 1000),
      };
    }
    return { locked: false, attempts: active.length };
  } catch {
    return { locked: false, attempts: 0 };
  }
}

export async function isLocked(email: string): Promise<boolean> {
  const info = await getLockoutInfo(email);
  return info.locked;
}

export async function ensureNotLocked(email: string): Promise<void> {
  const info = await getLockoutInfo(email);
  if (info.locked) {
    throw new AccountLockedError(
      `Hesap geçici olarak kilitli. ${Math.ceil((info.retryAfterSeconds ?? 900) / 60)} dakika sonra tekrar deneyin.`,
    );
  }
}

export async function recordFailedAttempt(
  email: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<LockoutInfo> {
  const key = trackerKey(email);
  const now = Date.now();
  const tracker: AttemptTracker = trackers.get(key) ?? { count: 0, firstAt: now };
  tracker.count += 1;

  let lockedUntil: number | undefined;
  if (tracker.count >= TIER_3) {
    lockedUntil = now + TIER_3_LOCK_MS;
  } else if (tracker.count >= TIER_2) {
    lockedUntil = now + TIER_2_LOCK_MS;
  } else if (tracker.count >= TIER_1) {
    lockedUntil = now + TIER_1_LOCK_MS;
  }
  tracker.lockedUntil = lockedUntil;
  trackers.set(key, tracker);

  try {
    const insert: Record<string, unknown> = {
      id: crypto.randomUUID(),
      email: key,
      attemptedAt: new Date(now).toISOString(),
    };
    if (ipAddress !== undefined) insert['ipAddress'] = ipAddress;
    if (userAgent !== undefined) insert['userAgent'] = userAgent;
    if (lockedUntil !== undefined) insert['lockedUntil'] = new Date(lockedUntil).toISOString();
    const { error } = await supabaseAdmin().from('failed_login_attempts').insert(insert);
    if (error) throw dbError(error);
  } catch (err) {
    console.error('[brute-force] persist failed', err);
  }

  return {
    locked: !!lockedUntil,
    attempts: tracker.count,
    lockedUntil: lockedUntil ? new Date(lockedUntil) : undefined,
    retryAfterSeconds: lockedUntil ? Math.ceil((lockedUntil - now) / 1000) : undefined,
  };
}

export async function clearAttempts(email: string): Promise<void> {
  const key = trackerKey(email);
  trackers.delete(key);
  try {
    const { error } = await supabaseAdmin()
      .from('failed_login_attempts')
      .delete()
      .eq('email', key)
      .is('lockedUntil', null);
    if (error) throw dbError(error);
  } catch (err) {
    console.error('[brute-force] clear failed', err);
  }
}

export const BRUTE_FORCE_TIERS = {
  tier1: { threshold: TIER_1, lockMs: TIER_1_LOCK_MS },
  tier2: { threshold: TIER_2, lockMs: TIER_2_LOCK_MS },
  tier3: { threshold: TIER_3, lockMs: TIER_3_LOCK_MS },
};

export const CAPTCHA_BYPASS_ENABLED =
  process.env['CYBERLISANS_CAPTCHA_BYPASS'] === 'true' && process.env['NODE_ENV'] !== 'production';
