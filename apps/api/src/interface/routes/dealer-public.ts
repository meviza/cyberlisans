import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { resolveDealerLink } from '../../domain/usecases/dealer/resolve-dealer-link';
import { dealerRepository } from '../../infrastructure/repositories/dealer.repository';
import { PaymentError } from '@cyberlisans/payments/errors';
import { resolveDealerLinkQuerySchema } from './dealer.schema';

export const dealerPublicRoutes = new Hono();

dealerPublicRoutes.use('*', async (c, next) => {
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
    console.error('[DEALER PUBLIC ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

dealerPublicRoutes.get('/resolve/:code', async (c) => {
  const code = c.req.param('code');
  const resolved = await resolveDealerLink(code);
  if (!resolved) {
    return c.json(
      { error: 'Bayi linki bulunamadı veya aktif değil', code: 'DEALER_LINK_NOT_FOUND' },
      404,
    );
  }
  const dealer = await dealerRepository.findById(resolved.dealerId);
  return c.json({
    code: resolved.code,
    dealerId: resolved.dealerId,
    companyName: dealer?.companyName ?? null,
    productId: resolved.productId,
    productSlug: resolved.productSlug ?? null,
    discountPercent: resolved.discountPercent,
    isActive: resolved.isActive,
  });
});

dealerPublicRoutes.get('/resolve', zValidator('query', resolveDealerLinkQuerySchema), async (c) => {
  const q = c.req.valid('query');
  const resolved = await resolveDealerLink(q.code);
  if (!resolved) {
    return c.json(
      { error: 'Bayi linki bulunamadı veya aktif değil', code: 'DEALER_LINK_NOT_FOUND' },
      404,
    );
  }
  const dealer = await dealerRepository.findById(resolved.dealerId);
  return c.json({
    code: resolved.code,
    dealerId: resolved.dealerId,
    companyName: dealer?.companyName ?? null,
    productId: resolved.productId,
    productSlug: resolved.productSlug ?? null,
    discountPercent: resolved.discountPercent,
    isActive: resolved.isActive,
  });
});
