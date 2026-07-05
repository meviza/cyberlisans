import { z } from 'zod';

export const escrowListSchema = z.object({
  status: z.enum(['HELD', 'RELEASED', 'REFUNDED', 'DISPUTED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const payoutsListSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const rejectPayoutSchema = z.object({
  rejectionReason: z.string().min(5).max(500),
});

export const resolveDisputeAdminSchema = z.object({
  resolution: z.enum(['REFUND', 'RELEASE', 'PARTIAL_REFUND']),
  refundAmount: z.number().positive().max(1_000_000).optional(),
  note: z.string().max(1000).optional(),
});
