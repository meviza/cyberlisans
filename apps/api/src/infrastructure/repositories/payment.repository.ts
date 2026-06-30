import { prisma } from '../db';
import type { IPaymentRepository } from '../../application/ports/repositories';
import type { PaymentEntity, Currency } from '../../domain/entities/wallet';

function toEntity(p: any): PaymentEntity {
  return {
    id: p.id,
    userId: p.userId,
    orderId: p.orderId,
    provider: p.provider,
    providerRef: p.providerRef,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    webhookPayload: p.webhookPayload,
    metadata: p.metadata,
    expiresAt: p.expiresAt,
    paidAt: p.paidAt,
    refundedAt: p.refundedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export class PaymentRepository implements IPaymentRepository {
  async create(input: Parameters<IPaymentRepository['create']>[0]): Promise<PaymentEntity> {
    const p = await prisma.payment.create({
      data: {
        userId: input.userId,
        orderId: input.orderId ?? null,
        provider: input.provider,
        amount: input.amount,
        currency: input.currency,
        expiresAt: input.expiresAt ?? null,
        metadata: (input.metadata as any) ?? undefined,
      },
    });
    return toEntity(p);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const p = await prisma.payment.findUnique({ where: { id } });
    return p ? toEntity(p) : null;
  }

  async findByProviderRef(
    provider: PaymentEntity['provider'],
    providerRef: string,
  ): Promise<PaymentEntity | null> {
    const p = await prisma.payment.findFirst({ where: { provider, providerRef } });
    return p ? toEntity(p) : null;
  }

  async updateStatus(
    id: string,
    status: PaymentEntity['status'],
    extras?: { providerRef?: string; webhookPayload?: Record<string, unknown>; paidAt?: Date },
  ): Promise<PaymentEntity> {
    const data: any = { status };
    if (extras?.providerRef) data.providerRef = extras.providerRef;
    if (extras?.webhookPayload) data.webhookPayload = extras.webhookPayload;
    if (extras?.paidAt) data.paidAt = extras.paidAt;
    const p = await prisma.payment.update({ where: { id }, data });
    return toEntity(p);
  }

  async listForUser(userId: string, limit: number, cursor?: string): Promise<PaymentEntity[]> {
    const p = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return p.map(toEntity);
  }

  async listPending(limit: number): Promise<PaymentEntity[]> {
    const p = await prisma.payment.findMany({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return p.map(toEntity);
  }
}

export const paymentRepository = new PaymentRepository();
