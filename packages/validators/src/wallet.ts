import { z } from 'zod';
import { currencySchema } from './auth';

export const topUpSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  currency: currencySchema,
  provider: z.enum(['PAYTR', 'PAPARA', 'NOWPAYMENTS', 'STRIPE', 'BANK_TRANSFER']),
  returnUrl: z.string().url().optional(),
});

export const withdrawalSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  currency: currencySchema,
  iban: z.string().regex(/^TR\d{24}$/, 'Geçerli bir TR IBAN girin').optional(),
  paparaNumber: z.string().regex(/^\d{10,12}$/).optional(),
});

export const adminBalanceAdjustmentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number(),
  currency: currencySchema,
  reason: z.string().min(5).max(500),
});

export const transferSchema = z.object({
  recipientUsername: z.string().min(3),
  amount: z.number().positive(),
  currency: currencySchema,
  note: z.string().max(200).optional(),
});

export type TopUpInput = z.infer<typeof topUpSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type AdminBalanceAdjustmentInput = z.infer<typeof adminBalanceAdjustmentSchema>;
export type TransferInput = z.infer<typeof transferSchema>;