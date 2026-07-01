import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
  currency: z.enum(['TRY', 'USD', 'EUR', 'USDT']),
  paymentMethod: z.enum(['PAYTR', 'PAPARA', 'NOWPAYMENTS', 'STRIPE', 'BANK_TRANSFER', 'WALLET']),
  notes: z.string().max(500).optional(),
  refCode: z.string().min(3).max(60).optional(),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED', 'FAILED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
