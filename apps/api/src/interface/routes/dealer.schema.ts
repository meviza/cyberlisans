import { z } from 'zod';

export const dealerRegisterSchema = z.object({
  companyName: z.string().min(2).max(200),
  taxId: z.string().min(5).max(20),
  taxOffice: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  logoUrl: z.string().url().max(500).optional(),
});

export const dealerUpdateSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  taxOffice: z.string().max(200).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  websiteUrl: z.string().url().max(500).nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});

export const adminDealerUpdateSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  taxOffice: z.string().max(200).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  websiteUrl: z.string().url().max(500).nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});

export const dealerRejectSchema = z.object({
  reason: z.string().min(5).max(500),
});

export const dealerSuspendSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const dealerLinkCreateSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Sadece harf, rakam, tire ve alt çizgi kullanılabilir'),
  productId: z.string().uuid().nullable().optional(),
  discountPercent: z.number().int().min(0).max(100).default(0),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const dealerLinkUpdateSchema = z.object({
  discountPercent: z.number().int().min(0).max(100).optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const dealerPayoutRequestSchema = z
  .object({
    amount: z.number().positive().max(1_000_000),
    currency: z.enum(['TRY', 'USD', 'EUR', 'USDT']),
    method: z.enum(['IBAN', 'PAPARA']),
    iban: z
      .string()
      .regex(/^TR\d{24}$/)
      .optional(),
    paparaNumber: z
      .string()
      .regex(/^\d{10,12}$/)
      .optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) =>
      (data.method === 'IBAN' && !!data.iban && !data.paparaNumber) ||
      (data.method === 'PAPARA' && !!data.paparaNumber && !data.iban),
    { message: 'IBAN veya Papara numarası methoda uygun olmalı' },
  );

export const dealerPayoutProcessSchema = z.object({
  action: z.enum(['approve', 'reject', 'complete']),
  rejectionReason: z.string().max(500).optional(),
});

export const listDealersQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED']).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listDealerLinksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listDealerSalesQuerySchema = z.object({
  status: z.enum(['PENDING', 'SETTLED', 'REFUNDED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listDealerPayoutsQuerySchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const resolveDealerLinkQuerySchema = z.object({
  code: z.string().min(3).max(60),
});

export type DealerRegisterInput = z.infer<typeof dealerRegisterSchema>;
export type DealerUpdateInput = z.infer<typeof dealerUpdateSchema>;
export type AdminDealerUpdateInput = z.infer<typeof adminDealerUpdateSchema>;
export type DealerLinkCreateInput = z.infer<typeof dealerLinkCreateSchema>;
export type DealerLinkUpdateInput = z.infer<typeof dealerLinkUpdateSchema>;
export type DealerPayoutRequestInput = z.infer<typeof dealerPayoutRequestSchema>;
export type DealerPayoutProcessInput = z.infer<typeof dealerPayoutProcessSchema>;
