import { createHmac, timingSafeEqual } from 'crypto';

const DEFAULT_REPLAY_WINDOW_MS = 5 * 60_000;

export interface WebhookVerification {
  valid: boolean;
  reason?: string;
}

export function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyTimestampInWindow(
  timestampHeader: string | undefined,
  windowMs: number = DEFAULT_REPLAY_WINDOW_MS,
  now: number = Date.now(),
): WebhookVerification {
  if (!timestampHeader) {
    return { valid: false, reason: 'missing timestamp' };
  }
  const ts = Number(timestampHeader);
  if (!Number.isFinite(ts) || ts <= 0) {
    return { valid: false, reason: 'invalid timestamp' };
  }
  const tsMs = ts < 1e12 ? ts * 1000 : ts;
  if (Math.abs(now - tsMs) > windowMs) {
    return { valid: false, reason: 'timestamp out of window' };
  }
  return { valid: true };
}

export function verifyHmacSignature(
  body: string,
  signature: string,
  secret: string,
  algo: 'sha256' | 'sha512' = 'sha256',
): WebhookVerification {
  if (!signature) return { valid: false, reason: 'missing signature' };
  if (!secret) return { valid: false, reason: 'misconfigured secret' };
  const expected = createHmac(algo, secret).update(body).digest('hex');
  if (!constantTimeEqual(expected, signature.toLowerCase())) {
    return { valid: false, reason: 'signature mismatch' };
  }
  return { valid: true };
}

export function isIpWhitelisted(
  ip: string,
  whitelist: string[] | undefined,
  cidrList: string[] = [],
): boolean {
  if (!whitelist || whitelist.length === 0) return true;
  if (whitelist.includes(ip)) return true;
  for (const cidr of cidrList) {
    if (matchCidr(ip, cidr)) return true;
  }
  return false;
}

function matchCidr(ip: string, cidr: string): boolean {
  const [base, bitsStr] = cidr.split('/');
  if (!base || !bitsStr) return false;
  const bits = Number(bitsStr);
  if (!Number.isFinite(bits)) return false;
  const ipInt = ipToInt(ip);
  const baseInt = ipToInt(base);
  if (ipInt === null || baseInt === null) return false;
  if (bits === 0) return true;
  const mask = (~0 << (32 - bits)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

function ipToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let acc = 0;
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    acc = (acc << 8) + n;
  }
  return acc >>> 0;
}

export const WEBHOOK_REPLAY_WINDOW_MS = DEFAULT_REPLAY_WINDOW_MS;
