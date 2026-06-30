import { z } from 'zod';
import { currencySchema } from './auth';

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(20),
  paymentMethod: z.enum(['WALLET', 'PAYTR', 'PAPARA', 'NOWPAYMENTS', 'STRIPE', 'BANK_TRANSFER']),
  currency: currencySchema,
  giftRecipientEmail: z.string().email().optional(),
  giftMessage: z.string().max(500).optional(),
  couponCode: z.string().max(50).optional(),
});

export const orderQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED', 'FAILED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminOrderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED', 'FAILED']).optional(),
  notes: z.string().max(1000).optional(),
  refundAmount: z.number().positive().optional(),
});

export type CartInput = z.infer<typeof cartSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type AdminOrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;