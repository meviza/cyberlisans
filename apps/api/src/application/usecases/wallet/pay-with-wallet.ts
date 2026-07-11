import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { paymentRepository } from '../../../infrastructure/repositories/payment.repository';
import {
  InsufficientBalanceError,
  OrderNotFoundError,
  OrderNotOwnedError,
  OrderNotPendingError,
  WalletNotFoundError,
} from '../../../domain/errors/wallet';
import type { Currency, PaymentEntity } from '../../../domain/entities/wallet';

export async function payWithWallet(input: {
  userId: string;
  orderId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const order = await orderRepository.findById(input.orderId);
  if (!order) throw new OrderNotFoundError();
  if (order.userId !== input.userId) throw new OrderNotOwnedError();
  if (order.status !== 'PENDING') throw new OrderNotPendingError();
  const w = await walletRepository.findByUserId(input.userId);
  if (!w) throw new WalletNotFoundError();
  const balance = {
    TRY: w.balanceTry,
    USD: w.balanceUsd,
    EUR: w.balanceEur,
    USDT: w.balanceUsdt,
  }[order.currency as Currency];
  if (balance < order.totalAmount) throw new InsufficientBalanceError();
  const result = await walletRepository.debit({
    userId: input.userId,
    currency: order.currency as Currency,
    amount: order.totalAmount,
    type: 'PURCHASE',
    description: `Sipariş #${order.id}`,
    referenceType: 'order',
    referenceId: order.id,
  });
  const payment = await paymentRepository.create({
    userId: input.userId,
    orderId: order.id,
    provider: 'WALLET' as PaymentEntity['provider'],
    amount: order.totalAmount,
    currency: order.currency as Currency,
    metadata: { method: 'wallet' },
  });
  await paymentRepository.updateStatus(payment.id, 'SUCCEEDED', { paidAt: new Date() });
  await orderRepository.markPaid(order.id, payment.id);
  return { payment, wallet: result.wallet };
}
