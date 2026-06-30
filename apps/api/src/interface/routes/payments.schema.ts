import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  orderId: z.string().uuid().optional(),
  amount: z.number().positive().max(1_000_000),
  currency: z.enum(['TRY', 'USD', 'EUR', 'USDT']),
  provider: z.enum(['PAYTR', 'PAPARA', 'NOWPAYMENTS', 'STRIPE', 'BANK_TRANSFER']),
  returnUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
});

export type InitiatePaymentInputBody = z.infer<typeof initiatePaymentSchema>;
export type RefundPaymentInputBody = z.infer<typeof refundPaymentSchema>;
