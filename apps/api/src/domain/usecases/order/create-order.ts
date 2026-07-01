import { prisma } from '../../../infrastructure/db';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import {
  ProductNotFoundError,
  ProductInactiveError,
  InsufficientStockError,
  EmptyCartError,
  NoKeysAvailableError,
} from '../../errors/product';
import type { Currency } from '../../entities/wallet';
import type { PaymentMethod } from '../../entities/product';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderUseCaseInput {
  userId: string;
  items: OrderItemInput[];
  currency: Currency;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  refCode?: string | null;
  ipAddress?: string;
  userAgent?: string;
}

const MAX_RETRIES = 5;

const CURRENCY_PRICE_FIELD: Record<Currency, 'priceTry' | 'priceUsd' | 'priceEur' | 'priceUsdt'> = {
  TRY: 'priceTry',
  USD: 'priceUsd',
  EUR: 'priceEur',
  USDT: 'priceUsdt',
};

export async function createOrder(input: CreateOrderUseCaseInput) {
  if (!input.items || input.items.length === 0) throw new EmptyCartError();
  const priceField = CURRENCY_PRICE_FIELD[input.currency];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const orderId = await prisma.$transaction(
        async (tx: typeof prisma) => {
          const itemsCreate: {
            productId: string;
            productKeyId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
          }[] = [];
          const stockUpdates: { productId: string; qty: number }[] = [];
          let totalAmount = 0;

          for (const item of input.items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });
            if (!product) throw new ProductNotFoundError();
            if (!product.isActive) throw new ProductInactiveError();
            if (product.stock < item.quantity) {
              throw new InsufficientStockError(item.productId, item.quantity, product.stock);
            }
            const unitPrice = Number(product[priceField]);
            const keys = await tx.productKey.findMany({
              where: {
                productId: item.productId,
                isUsed: false,
                reservedFor: null,
              },
              orderBy: { createdAt: 'asc' },
              take: item.quantity,
            });
            if (keys.length < item.quantity) throw new NoKeysAvailableError();
            const now = new Date();
            for (const k of keys) {
              await tx.productKey.update({
                where: { id: k.id },
                data: { reservedAt: now, reservedFor: input.userId },
              });
              itemsCreate.push({
                productId: item.productId,
                productKeyId: k.id,
                quantity: 1,
                unitPrice,
                totalPrice: unitPrice,
              });
              totalAmount += unitPrice;
            }
            stockUpdates.push({ productId: item.productId, qty: item.quantity });
          }

          const order = await tx.order.create({
            data: {
              userId: input.userId,
              totalAmount,
              currency: input.currency,
              status: 'PENDING',
              paymentMethod: input.paymentMethod,
              refCode: input.refCode ?? null,
              notes: input.notes ?? null,
              items: { create: itemsCreate },
            },
          });

          for (const s of stockUpdates) {
            await tx.product.update({
              where: { id: s.productId },
              data: { stock: { decrement: s.qty } },
            });
          }

          return order.id;
        },
        { isolationLevel: 'Serializable' },
      );

      await auditRepository.log({
        actorId: input.userId,
        action: 'CREATE',
        targetType: 'order',
        targetId: orderId,
        payload: { items: input.items.length, currency: input.currency },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      return orderRepository.findById(orderId, true);
    } catch (err: any) {
      if (
        err instanceof ProductNotFoundError ||
        err instanceof ProductInactiveError ||
        err instanceof InsufficientStockError ||
        err instanceof EmptyCartError ||
        err instanceof NoKeysAvailableError
      ) {
        throw err;
      }
      if (err?.code === 'P2034' && attempt < MAX_RETRIES - 1) continue;
      throw err;
    }
  }
  throw new Error('ORDER_CREATION_CONFLICT');
}
