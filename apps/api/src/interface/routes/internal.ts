import { Hono } from 'hono';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '../../infrastructure/supabase-db';
import { auditRepository } from '../../infrastructure/repositories/audit.repository';
import { errorHandler } from '../middleware/error-handler';

export const internalRoutes = new Hono();

const SERVICE_HEADER = 'x-internal-secret';
const SIGNATURE_HEADER = 'x-internal-signature';
const TIMESTAMP_HEADER = 'x-internal-timestamp';
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

interface InternalEnv {
  INTERNAL_SERVICE_SECRET?: string;
}

function getSecret(): string | null {
  const secret = process.env['INTERNAL_SERVICE_SECRET'];
  return secret && secret.length >= 32 ? secret : null;
}

function verifySecret(provided: string | undefined, expected: string): boolean {
  if (!provided || provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided, 'utf8'), Buffer.from(expected, 'utf8'));
  } catch {
    return false;
  }
}

function verifySignature(
  secret: string,
  timestamp: string | undefined,
  body: string,
  signature: string | undefined,
): boolean {
  if (!timestamp || !signature) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() - ts) > MAX_CLOCK_SKEW_MS) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
  const provided = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  if (provided.length !== expectedBuf.length) return false;
  try {
    return timingSafeEqual(provided, expectedBuf);
  } catch {
    return false;
  }
}

function unauthorized(c: Parameters<Parameters<Hono['onError']>[0]>[1], reason: string) {
  return c.json({ ok: false, error: reason, code: 'INTERNAL_UNAUTHORIZED' }, 401);
}

internalRoutes.use('*', async (c, next) => {
  const secret = getSecret();
  if (!secret) return unauthorized(c, 'INTERNAL_DISABLED');

  const provided = c.req.header(SERVICE_HEADER);
  if (!verifySecret(provided, secret)) return unauthorized(c, 'BAD_SECRET');

  if (c.req.method !== 'GET') {
    const raw = await c.req.raw.clone().text();
    const signature = c.req.header(SIGNATURE_HEADER);
    const timestamp = c.req.header(TIMESTAMP_HEADER);
    if (!verifySignature(secret, timestamp, raw, signature)) {
      return unauthorized(c, 'BAD_SIGNATURE');
    }
  }

  await next();
});

internalRoutes.onError((err, c) => errorHandler(err, c));

internalRoutes.get('/health', (c) => {
  return c.json({ ok: true, scope: 'internal', timestamp: new Date().toISOString() });
});

internalRoutes.post('/auto-release', async (c) => {
  const { data, error } = await supabaseAdmin().rpc('auto_release_escrow');
  if (error) return c.json({ ok: false, error: error.message, code: 'RPC_ERROR' }, 500);

  const releasedCount = (data as number | null) ?? 0;
  const correlationId = crypto.randomUUID();

  await auditRepository.log({
    actorId: null,
    action: 'STATUS_CHANGE',
    targetType: 'escrow',
    targetId: 'auto_release',
    payload: { released: releasedCount, source: 'trigger.dev', correlationId },
  });

  return c.json({
    ok: true,
    releasedCount,
    correlationId,
    timestamp: new Date().toISOString(),
  });
});

export type { InternalEnv };
