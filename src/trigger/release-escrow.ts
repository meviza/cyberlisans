import { logger, schedules } from '@trigger.dev/sdk/v3';
import { createHmac, randomUUID } from 'node:crypto';

type AutoReleaseResult = {
  ok: boolean;
  releasedCount?: number;
  correlationId?: string;
  error?: string;
  code?: string;
  timestamp?: string;
};

function signRequest(secret: string, timestamp: string, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

async function callInternalAutoRelease(apiUrl: string, secret: string): Promise<AutoReleaseResult> {
  const timestamp = Date.now().toString();
  const body = '';
  const signature = signRequest(secret, timestamp, body);

  const res = await fetch(`${apiUrl}/api/internal/auto-release`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': secret,
      'X-Internal-Signature': signature,
      'X-Internal-Timestamp': timestamp,
    },
  });

  let json: AutoReleaseResult;
  try {
    json = (await res.json()) as AutoReleaseResult;
  } catch {
    return { ok: false, error: `Non-JSON response (status ${res.status})` };
  }

  if (!res.ok || !json.ok) {
    logger.error('auto-release failed', { status: res.status, body: json });
    throw new Error(`auto-release failed: ${json.error ?? `status ${res.status}`}`);
  }

  return json;
}

export const releaseEscrowTask = schedules.task({
  id: 'release-escrow',
  cron: {
    pattern: '0 3 * * *',
    timezone: 'Europe/Istanbul',
    environments: ['PRODUCTION'],
  },
  run: async (payload, { ctx }) => {
    const apiUrl = process.env['API_URL'];
    const secret = process.env['INTERNAL_SERVICE_SECRET'];

    if (!apiUrl) throw new Error('API_URL env is required');
    if (!secret || secret.length < 32) {
      throw new Error('INTERNAL_SERVICE_SECRET must be at least 32 chars');
    }

    const scheduleId = (payload as { scheduleId?: string }).scheduleId;
    const timezone = (payload as { timezone?: string }).timezone;
    const timestamp = (payload as { timestamp?: Date }).timestamp ?? new Date();

    logger.info('auto-release escrow starting', {
      scheduleId,
      timezone,
      runId: ctx.run.id,
      timestamp: timestamp.toISOString(),
    });

    const result = await callInternalAutoRelease(apiUrl, secret);

    logger.info('auto-release escrow done', {
      releasedCount: result.releasedCount,
      correlationId: result.correlationId,
    });

    return {
      releasedCount: result.releasedCount ?? 0,
      correlationId: result.correlationId ?? randomUUID(),
      timestamp: result.timestamp ?? new Date().toISOString(),
    };
  },
});

export type { AutoReleaseResult };
