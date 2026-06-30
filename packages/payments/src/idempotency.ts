import { createHash, randomBytes } from 'crypto';

interface IdempotencyRecord {
  key: string;
  paymentId: string;
  result: unknown;
  createdAt: number;
}

const store = new Map<string, IdempotencyRecord>();

const TTL_MS = 24 * 60 * 60 * 1000;

function cleanup(): void {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now - v.createdAt > TTL_MS) store.delete(k);
  }
}

export function getOrCreateIdempotencyKey(prefix: string): string {
  cleanup();
  return `${prefix}-${randomBytes(8).toString('hex')}`;
}

export function idempotencyHash(input: Record<string, unknown>): string {
  const sorted = JSON.stringify(input, Object.keys(input).sort());
  return createHash('sha256').update(sorted).digest('hex');
}

export function checkIdempotency(key: string): IdempotencyRecord | null {
  cleanup();
  const r = store.get(key);
  if (!r) return null;
  if (Date.now() - r.createdAt > TTL_MS) {
    store.delete(key);
    return null;
  }
  return r;
}

export function recordIdempotency(key: string, paymentId: string, result: unknown): void {
  cleanup();
  store.set(key, { key, paymentId, result, createdAt: Date.now() });
}

export interface IdempotencyContext {
  key: string;
  isReplay: boolean;
}

export function makeIdempotencyContext(
  prefix: string,
  payload: Record<string, unknown>,
): IdempotencyContext {
  const hash = idempotencyHash(payload);
  const key = `${prefix}-${hash}`;
  return { key, isReplay: !!checkIdempotency(key) };
}
