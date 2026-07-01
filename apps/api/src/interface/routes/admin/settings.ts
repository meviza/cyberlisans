import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ZodError } from 'zod';
import { authMiddleware, requireAdmin } from '../../../infrastructure/auth';
import { prisma } from '../../../infrastructure/db';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { getRequestMeta } from '../../middleware/request-meta';
import { PaymentError } from '@cyberlisans/payments/errors';

export const adminSettingsRoutes = new Hono();

adminSettingsRoutes.use('*', authMiddleware, requireAdmin());

adminSettingsRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json({ error: 'Validation', issues: err.issues }, 400);
    }
    if (err instanceof PaymentError) {
      return c.json(
        { error: err.message, code: err.code },
        err.statusCode as 400 | 401 | 403 | 404 | 409,
      );
    }
    console.error('[ADMIN SETTINGS ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

interface AppSettings {
  general: {
    siteName: string;
    supportEmail: string;
    contactPhone: string;
  };
  payments: {
    activeProviders: string[];
    testMode: boolean;
    webhookUrls: Record<string, string>;
    commissionByCategory: Record<string, number>;
  };
  currency: {
    manualRates: Record<string, number>;
    updatedAt: string | null;
  };
  kvkk: {
    documentVersion: string;
  };
  mailTemplates: {
    enabled: boolean;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    siteName: 'CyberLisans',
    supportEmail: 'destek@cyberlisans.com',
    contactPhone: '+90 850 000 00 00',
  },
  payments: {
    activeProviders: ['PAYTR', 'PAPARA', 'STRIPE', 'NOWPAYMENTS', 'BANK_TRANSFER', 'WALLET'],
    testMode: process.env['NODE_ENV'] !== 'production',
    webhookUrls: {
      PAYTR: `${process.env['NEXT_PUBLIC_APP_URL'] ?? ''}/api/webhooks/paytr`,
      PAPARA: `${process.env['NEXT_PUBLIC_APP_URL'] ?? ''}/api/webhooks/papara`,
      STRIPE: `${process.env['NEXT_PUBLIC_APP_URL'] ?? ''}/api/webhooks/stripe`,
      NOWPAYMENTS: `${process.env['NEXT_PUBLIC_APP_URL'] ?? ''}/api/webhooks/nowpayments`,
    },
    commissionByCategory: {},
  },
  currency: {
    manualRates: {
      TRY: 1,
      USD: 0.03,
      EUR: 0.028,
      USDT: 0.03,
    },
    updatedAt: null,
  },
  kvkk: {
    documentVersion: '1.0.0',
  },
  mailTemplates: {
    enabled: false,
  },
};

const SETTINGS_KEY = 'app_settings_v1';

async function loadSettings(): Promise<AppSettings> {
  try {
    const row = await prisma.auditLog.findFirst({
      where: { targetType: 'settings', targetId: SETTINGS_KEY },
      orderBy: { createdAt: 'desc' },
    });
    if (!row || !row.payload) return DEFAULT_SETTINGS;
    const stored = row.payload as unknown as AppSettings;
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      general: { ...DEFAULT_SETTINGS.general, ...(stored.general ?? {}) },
      payments: { ...DEFAULT_SETTINGS.payments, ...(stored.payments ?? {}) },
      currency: { ...DEFAULT_SETTINGS.currency, ...(stored.currency ?? {}) },
      kvkk: { ...DEFAULT_SETTINGS.kvkk, ...(stored.kvkk ?? {}) },
      mailTemplates: { ...DEFAULT_SETTINGS.mailTemplates, ...(stored.mailTemplates ?? {}) },
    };
  } catch (err) {
    console.error('[SETTINGS LOAD ERROR]', err);
    return DEFAULT_SETTINGS;
  }
}

adminSettingsRoutes.get('/', async (c) => {
  const settings = await loadSettings();
  return c.json(settings);
});

const patchSchema = z
  .object({
    general: z
      .object({
        siteName: z.string().min(1).max(120).optional(),
        supportEmail: z.string().email().optional(),
        contactPhone: z.string().min(5).max(40).optional(),
      })
      .optional(),
    payments: z
      .object({
        activeProviders: z.array(z.string()).optional(),
        testMode: z.boolean().optional(),
        commissionByCategory: z.record(z.string(), z.number().min(0).max(100)).optional(),
      })
      .optional(),
    currency: z
      .object({
        manualRates: z.record(z.string(), z.number().positive()).optional(),
        updatedAt: z.string().datetime().nullable().optional(),
      })
      .optional(),
    kvkk: z
      .object({
        documentVersion: z.string().min(1).max(40).optional(),
      })
      .optional(),
    mailTemplates: z
      .object({
        enabled: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

adminSettingsRoutes.patch('/', zValidator('json', patchSchema), async (c) => {
  const admin = c.get('user');
  const meta = getRequestMeta(c);
  const body = c.req.valid('json');
  const current = await loadSettings();
  const next: AppSettings = {
    general: { ...current.general, ...(body.general ?? {}) },
    payments: {
      ...current.payments,
      ...(body.payments ?? {}),
      webhookUrls: current.payments.webhookUrls,
    },
    currency: {
      ...current.currency,
      ...(body.currency ?? {}),
      updatedAt:
        body.currency?.manualRates !== undefined
          ? new Date().toISOString()
          : current.currency.updatedAt,
    },
    kvkk: { ...current.kvkk, ...(body.kvkk ?? {}) },
    mailTemplates: { ...current.mailTemplates, ...(body.mailTemplates ?? {}) },
  };
  await auditRepository.log({
    actorId: admin.sub,
    action: 'SETTINGS_CHANGE',
    targetType: 'settings',
    targetId: SETTINGS_KEY,
    payload: next as unknown as Record<string, unknown>,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  return c.json(next);
});
