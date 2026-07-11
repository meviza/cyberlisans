import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { authMiddleware, requireTwoFactor } from '../../infrastructure/auth';
import { getDealerProfile } from '../../application/usecases/dealer/get-dealer-profile';
import { registerDealer } from '../../application/usecases/dealer/register-dealer';
import { updateDealerProfile } from '../../application/usecases/dealer/update-dealer-profile';
import { createDealerLink } from '../../application/usecases/dealer/create-dealer-link';
import {
  listDealerLinks,
  updateDealerLink,
  deleteDealerLink,
} from '../../application/usecases/dealer/list-dealer-links';
import {
  listDealerSales,
  getDealerStats,
} from '../../application/usecases/dealer/list-dealer-sales';
import {
  requestDealerPayout,
  listDealerPayouts,
} from '../../application/usecases/dealer/request-dealer-payout';
import { getRequestMeta } from '../middleware/request-meta';
import { PaymentError } from '@cyberlisans/payments/errors';
import { createRateLimiter, RATE_LIMIT_CONFIGS } from '../middleware/security/rate-limit';
import { userTwoFactorRepository } from '../../infrastructure/repositories/user-two-factor.repository';
import {
  dealerRegisterSchema,
  dealerUpdateSchema,
  dealerLinkCreateSchema,
  dealerLinkUpdateSchema,
  dealerPayoutRequestSchema,
  listDealerLinksQuerySchema,
  listDealerSalesQuerySchema,
  listDealerPayoutsQuerySchema,
} from './dealer.schema';

export const dealerRoutes = new Hono();

const dealerRateLimit = createRateLimiter({ config: RATE_LIMIT_CONFIGS.dealer });
const twoFaGuard = requireTwoFactor(async (userId: string) => {
  const rec = await userTwoFactorRepository.findByUserId(userId);
  return rec?.enabled === true;
});

dealerRoutes.use('*', authMiddleware);
dealerRoutes.use('*', dealerRateLimit);
dealerRoutes.use('/links/*', twoFaGuard);
dealerRoutes.use('/payouts*', twoFaGuard);

dealerRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json({ error: 'Validation', code: 'VALIDATION_ERROR', issues: err.issues }, 400);
    }
    if (err instanceof PaymentError) {
      return c.json(
        { error: err.message, code: err.code },
        err.statusCode as 400 | 401 | 403 | 404 | 409,
      );
    }
    console.error('[DEALER ERROR]', err);
    return c.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin', code: 'INTERNAL_ERROR' }, 500);
  }
});

dealerRoutes.get('/me', async (c) => {
  const user = c.get('user');
  const profile = await getDealerProfile(user.sub);
  return c.json(profile);
});

dealerRoutes.post('/register', zValidator('json', dealerRegisterSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const profile = await registerDealer({
    userId: user.sub,
    companyName: body.companyName,
    taxId: body.taxId,
    taxOffice: body.taxOffice ?? null,
    address: body.address ?? null,
    phone: body.phone ?? null,
    websiteUrl: body.websiteUrl ?? null,
    logoUrl: body.logoUrl ?? null,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  return c.json(profile, 201);
});

dealerRoutes.patch('/me', zValidator('json', dealerUpdateSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const current = await getDealerProfile(user.sub);
  const updated = await updateDealerProfile({
    dealerId: current.id,
    actorId: user.sub,
    isAdmin: false,
    data: body,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  return c.json(updated);
});

dealerRoutes.get('/links', zValidator('query', listDealerLinksQuerySchema), async (c) => {
  const user = c.get('user');
  const q = c.req.valid('query');
  const current = await getDealerProfile(user.sub);
  return c.json(
    await listDealerLinks({
      dealerId: current.id,
      page: q.page,
      limit: q.limit,
      isActive: q.isActive,
    }),
  );
});

dealerRoutes.get('/commissions', zValidator('query', listDealerSalesQuerySchema), async (c) => {
  const user = c.get('user');
  const q = c.req.valid('query');
  const current = await getDealerProfile(user.sub);
  const sales = await listDealerSales({
    dealerId: current.id,
    status: q.status,
    page: q.page,
    limit: q.limit,
  });
  const items = sales.items ?? [];
  return c.json({
    ...sales,
    totalEarned: items.reduce((sum, sale) => sum + sale.commissionAmount, 0),
    pendingSettlement: items
      .filter((sale) => sale.status === 'PENDING')
      .reduce((sum, sale) => sum + sale.commissionAmount, 0),
    settled: items
      .filter((sale) => sale.status === 'SETTLED')
      .reduce((sum, sale) => sum + sale.commissionAmount, 0),
  });
});

dealerRoutes.post('/links', zValidator('json', dealerLinkCreateSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const current = await getDealerProfile(user.sub);
  const link = await createDealerLink({
    dealerId: current.id,
    code: body.code,
    productId: body.productId ?? null,
    discountPercent: body.discountPercent ?? 0,
    maxUses: body.maxUses ?? null,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  return c.json(link, 201);
});

dealerRoutes.patch('/links/:id', zValidator('json', dealerLinkUpdateSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const current = await getDealerProfile(user.sub);
  const link = await updateDealerLink({
    linkId: id,
    dealerId: current.id,
    data: {
      discountPercent: body.discountPercent,
      maxUses: body.maxUses === undefined ? undefined : body.maxUses,
      isActive: body.isActive,
      expiresAt:
        body.expiresAt === undefined ? undefined : body.expiresAt ? new Date(body.expiresAt) : null,
      productId: body.productId === undefined ? undefined : body.productId,
    },
  });
  return c.json(link);
});

dealerRoutes.delete('/links/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const current = await getDealerProfile(user.sub);
  await deleteDealerLink({ linkId: id, dealerId: current.id });
  return c.json({ deleted: true });
});

dealerRoutes.get('/sales', zValidator('query', listDealerSalesQuerySchema), async (c) => {
  const user = c.get('user');
  const q = c.req.valid('query');
  const current = await getDealerProfile(user.sub);
  return c.json(
    await listDealerSales({
      dealerId: current.id,
      status: q.status,
      page: q.page,
      limit: q.limit,
    }),
  );
});

dealerRoutes.get('/stats', async (c) => {
  const user = c.get('user');
  const current = await getDealerProfile(user.sub);
  return c.json(await getDealerStats(current.id));
});

dealerRoutes.post('/payouts', zValidator('json', dealerPayoutRequestSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const current = await getDealerProfile(user.sub);
  const destination =
    body.method === 'IBAN' ? (body.iban as string) : (body.paparaNumber as string);
  const payout = await requestDealerPayout({
    dealerId: current.id,
    userId: user.sub,
    amount: body.amount,
    currency: 'TRY',
    method: body.method,
    destination,
    notes: body.notes ?? null,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  return c.json(payout, 201);
});

dealerRoutes.get('/payouts', zValidator('query', listDealerPayoutsQuerySchema), async (c) => {
  const user = c.get('user');
  const q = c.req.valid('query');
  const current = await getDealerProfile(user.sub);
  return c.json(
    await listDealerPayouts({
      dealerId: current.id,
      page: q.page,
      limit: q.limit,
    }),
  );
});
