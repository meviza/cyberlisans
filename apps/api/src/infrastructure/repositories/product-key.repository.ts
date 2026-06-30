import { prisma } from '../db';
import type { IProductKeyRepository } from '../../application/ports/repositories';
import type { ProductKeyEntity } from '../../domain/entities/product';
import { NoKeysAvailableError } from '../../domain/errors/product';

function toEntity(k: any): ProductKeyEntity {
  return {
    id: k.id,
    productId: k.productId,
    code: k.code,
    isUsed: k.isUsed,
    usedById: k.usedById ?? null,
    usedAt: k.usedAt ?? null,
    reservedAt: k.reservedAt ?? null,
    reservedFor: k.reservedFor ?? null,
    createdAt: k.createdAt,
  };
}

const MAX_RESERVATION_RETRIES = 5;

export class ProductKeyRepository implements IProductKeyRepository {
  async listByProduct(
    productId: string,
    options: { availableOnly?: boolean; page: number; limit: number },
  ): Promise<{ items: ProductKeyEntity[]; total: number }> {
    const where: any = { productId };
    if (options.availableOnly) where.isUsed = false;
    const [items, total] = await prisma.$transaction([
      prisma.productKey.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.productKey.count({ where }),
    ]);
    return { items: items.map(toEntity), total };
  }

  async reserve(productId: string, qty: number, userId: string): Promise<ProductKeyEntity[]> {
    for (let attempt = 0; attempt < MAX_RESERVATION_RETRIES; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx: typeof prisma) => {
            const keys = await tx.productKey.findMany({
              where: { productId, isUsed: false, reservedFor: null },
              orderBy: { createdAt: 'asc' },
              take: qty,
            });
            if (keys.length < qty) {
              throw new NoKeysAvailableError();
            }
            const now = new Date();
            const updated = await Promise.all(
              keys.map((k: { id: string }) =>
                tx.productKey.update({
                  where: { id: k.id },
                  data: { reservedAt: now, reservedFor: userId },
                }),
              ),
            );
            return updated.map(toEntity);
          },
          { isolationLevel: 'Serializable' },
        );
      } catch (err: any) {
        if (err instanceof NoKeysAvailableError) throw err;
        if (err?.code === 'P2034' && attempt < MAX_RESERVATION_RETRIES - 1) continue;
        throw err;
      }
    }
    throw new Error('KEY_RESERVATION_CONFLICT');
  }

  async markUsedByOrderItem(orderItemId: string, userId: string): Promise<void> {
    await prisma.$transaction(async (tx: typeof prisma) => {
      const item = await tx.orderItem.findUnique({ where: { id: orderItemId } });
      if (!item || !item.productKeyId) return;
      await tx.productKey.update({
        where: { id: item.productKeyId },
        data: {
          isUsed: true,
          usedById: userId,
          usedAt: new Date(),
          reservedAt: null,
          reservedFor: null,
        },
      });
    });
  }

  async returnKeysForOrderItem(orderItemId: string): Promise<void> {
    await prisma.$transaction(async (tx: typeof prisma) => {
      const item = await tx.orderItem.findUnique({ where: { id: orderItemId } });
      if (!item || !item.productKeyId) return;
      const key = await tx.productKey.findUnique({ where: { id: item.productKeyId } });
      if (!key) return;
      if (key.isUsed) return;
      await tx.productKey.update({
        where: { id: item.productKeyId },
        data: { reservedAt: null, reservedFor: null },
      });
    });
  }

  async countAvailable(productId: string): Promise<number> {
    return prisma.productKey.count({
      where: { productId, isUsed: false },
    });
  }

  async bulkCreate(productId: string, codes: string[]): Promise<number> {
    const data = codes.map((code) => ({ productId, code }));
    const result = await prisma.productKey.createMany({ data, skipDuplicates: true });
    return result.count;
  }

  async deleteById(id: string): Promise<void> {
    await prisma.productKey.delete({ where: { id } });
  }

  async findById(id: string): Promise<ProductKeyEntity | null> {
    const k = await prisma.productKey.findUnique({ where: { id } });
    return k ? toEntity(k) : null;
  }
}

export const productKeyRepository = new ProductKeyRepository();
