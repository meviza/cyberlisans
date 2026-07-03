import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../../infrastructure/auth';
import { getRequestMeta } from '../middleware/request-meta';
import { errorHandler } from '../middleware/error-handler';
import { ApplySellerUseCase, toSellerOutput } from '../../application/usecases/seller/apply-seller';
import { GetMySellerUseCase } from '../../application/usecases/seller/get-my-seller';
import { GetSellerBySlugUseCase } from '../../application/usecases/seller/get-seller-by-slug';
import type { SellerRepositoryPort } from '../../application/ports/seller';
import type { IAuditRepository } from '../../application/ports/repositories';

export const sellerRoutes = new Hono();

const applySchema = z.object({
  companyName: z.string().min(2).max(200),
  taxId: z.string().min(5).max(20),
  taxOffice: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  bio: z.string().max(2000).optional(),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().max(500).optional(),
});

sellerRoutes.post('/apply', authMiddleware, zValidator('json', applySchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const { sellerRepository, auditRepository } = await importWire();
  const uc = new ApplySellerUseCase({ sellers: sellerRepository, audit: auditRepository });
  const seller = await uc.execute(
    {
      userId: user.sub,
      companyName: body.companyName,
      taxId: body.taxId,
      taxOffice: body.taxOffice,
      address: body.address,
      phone: body.phone,
      websiteUrl: body.websiteUrl,
      bio: body.bio,
      slug: body.slug,
      logoUrl: body.logoUrl,
    },
    meta,
  );
  return c.json(seller, 201);
});

sellerRoutes.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const { sellerRepository } = await importWire();
  const uc = new GetMySellerUseCase({ sellers: sellerRepository });
  const seller = await uc.execute(user.sub);
  if (!seller) return c.json({ error: 'Satıcı profili bulunamadı', code: 'NOT_FOUND' }, 404);
  return c.json(seller);
});

sellerRoutes.get('/:slug/public', async (c) => {
  const slug = c.req.param('slug');
  const { sellerRepository } = await importWire();
  const uc = new GetSellerBySlugUseCase({ sellers: sellerRepository });
  return c.json(await uc.execute(slug));
});

sellerRoutes.onError((err, c) => errorHandler(err, c));

async function importWire(): Promise<{
  sellerRepository: SellerRepositoryPort;
  auditRepository: IAuditRepository;
}> {
  const sellerMod = await import('../../infrastructure/repositories/seller.repository');
  const auditMod = await import('../../infrastructure/repositories/audit.repository');
  return {
    sellerRepository: sellerMod.sellerRepository,
    auditRepository: auditMod.auditRepository,
  };
}

void toSellerOutput;
