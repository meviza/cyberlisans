import { z } from 'zod';
import { currencySchema } from './auth';

export const paymentInitiateSchema = z.object({
  orderId: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: currencySchema,
  provider: z.enum(['PAYTR', 'PAPARA', 'NOWPAYMENTS', 'STRIPE', 'BANK_TRANSFER']),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const bankTransferConfirmSchema = z.object({
  paymentId: z.string().uuid(),
  receiptUrl: z.string().url(),
  senderName: z.string().min(3).max(100),
  senderIban: z.string().regex(/^TR\d{24}$/),
  amount: z.number().positive(),
  currency: currencySchema,
});

export type PaymentInitiateInput = z.infer<typeof paymentInitiateSchema>;
export type BankTransferConfirmInput = z.infer<typeof bankTransferConfirmSchema>;