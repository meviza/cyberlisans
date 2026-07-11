import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { productKeyRepository } from '../../../infrastructure/repositories/product-key.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { supabaseAdmin, dbError } from '../../../infrastructure/db';
import {
  ProductNotFoundError,
  ProductInactiveError,
  InsufficientStockError,
  EmptyCartError,
  NoKeysAvailableError,
} from '../../../domain/errors/product';
import type { Currency } from '../../../domain/entities/wallet';
import type { PaymentMethod } from '../../../domain/entities/product';
import type { CreateOrderItemInput } from '../../ports/repositories';

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

async function releaseKeyIds(keyIds: string[]): Promise<void> {
  if (keyIds.length === 0) return;
  const { error } = await supabaseAdmin()
    .from('product_keys')
    .update({ reservedAt: null, reservedFor: null })
    .in('id', keyIds)
    .eq('isUsed', false);
  if (error) throw dbError(error);
}

/**
 * Create a PENDING order with server-side pricing and key reservation.
 * Uses Supabase repositories (not Prisma) — atomic best-effort with rollback on failure.
 */
export async function createOrder(input: CreateOrderUseCaseInput) {
  if (!input.items || input.items.length === 0) throw new EmptyCartError();
  const priceField = CURRENCY_PRICE_FIELD[input.currency];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const reservedKeyIds: string[] = [];
    try {
      const itemsCreate: CreateOrderItemInput[] = [];
      const stockUpdates: { productId: string; qty: number }[] = [];
      let totalAmount = 0;

      for (const item of input.items) {
        if (!item.quantity || item.quantity < 1) continue;
        const product = await productRepository.findById(item.productId);
        if (!product) throw new ProductNotFoundError();
        if (!product.isActive) throw new ProductInactiveError();
        if (product.stock < item.quantity) {
          throw new InsufficientStockError(item.productId, item.quantity, product.stock);
        }

        const unitPrice = Number(product[priceField] ?? 0);
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw new ProductInactiveError();
        }

        // KEY / AUTO listings reserve inventory keys; MANUAL can still use keys if present.
        const keys = await productKeyRepository.reserve(
          item.productId,
          item.quantity,
          input.userId,
        );
        for (const k of keys) {
          reservedKeyIds.push(k.id);
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

      if (itemsCreate.length === 0) throw new EmptyCartError();

      const order = await orderRepository.createWithItems({
        userId: input.userId,
        totalAmount,
        currency: input.currency,
        paymentMethod: input.paymentMethod,
        notes: input.notes ?? null,
        items: itemsCreate,
      });

      // Best-effort stock decrement after successful insert
      for (const s of stockUpdates) {
        await productRepository.decrementStock(s.productId, s.qty);
      }

      // Optional referral code patch
      if (input.refCode) {
        await supabaseAdmin()
          .from('orders')
          .update({ refCode: input.refCode, updatedAt: new Date().toISOString() })
          .eq('id', order.id);
      }

      await auditRepository.log({
        actorId: input.userId,
        action: 'CREATE',
        targetType: 'order',
        targetId: order.id,
        payload: {
          items: input.items.length,
          currency: input.currency,
          totalAmount,
          paymentMethod: input.paymentMethod,
        },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      return orderRepository.findById(order.id, true);
    } catch (err: unknown) {
      // Always release any keys reserved in this attempt on failure
      try {
        await releaseKeyIds(reservedKeyIds);
      } catch {
        /* ignore secondary errors */
      }

      if (
        err instanceof ProductNotFoundError ||
        err instanceof ProductInactiveError ||
        err instanceof InsufficientStockError ||
        err instanceof EmptyCartError ||
        err instanceof NoKeysAvailableError
      ) {
        throw err;
      }

      const message = err instanceof Error ? err.message : String(err);
      const isConflict =
        message.includes('KEY_RESERVATION_CONFLICT') ||
        message.includes('23505') ||
        message.includes('conflict');
      if (isConflict && attempt < MAX_RETRIES - 1) continue;
      throw err;
    }
  }
  throw new Error('ORDER_CREATION_CONFLICT');
}
