import { Hono } from 'hono';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { prisma } from '../../../infrastructure/db';

export const adminStatsRoutes = new Hono();

adminStatsRoutes.use('*', ...createAdminStack());

adminStatsRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
});

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

adminStatsRoutes.get('/', async (c) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from30 = new Date(today);
  from30.setDate(today.getDate() - 29);

  const dayMap = new Map<string, { orders: number; revenue: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(from30);
    d.setDate(from30.getDate() + i);
    dayMap.set(dayKey(d), { orders: 0, revenue: 0 });
  }

  const [
    totalUsers,
    newUsers30,
    totalOrders,
    ordersToday,
    activeProducts,
    paidOrders,
    payments,
    topProducts,
    pendingDealers,
    pendingOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: from30 } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      where: { status: { in: ['PAID', 'FULFILLED'] } },
      select: { createdAt: true, totalAmount: true },
    }),
    prisma.payment.groupBy({ by: ['provider'], _count: { _all: true } }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.dealerProfile.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: 10 } } }),
  ]);

  for (const order of paidOrders) {
    const key = dayKey(order.createdAt);
    const row = dayMap.get(key);
    if (row) {
      row.orders += 1;
      row.revenue += Number(order.totalAmount ?? 0);
    }
  }

  const productIds = topProducts.map((p: { productId: string }) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true },
  });
  const productName = new Map(products.map((p: { id: string; title: string }) => [p.id, p.title]));

  const paymentsByMethod = {
    WALLET: 0,
    PAYTR: 0,
    PAPARA: 0,
    STRIPE: 0,
    NOWPAYMENTS: 0,
    BANK_TRANSFER: 0,
  };
  for (const p of payments as Array<{
    provider: keyof typeof paymentsByMethod;
    _count: { _all: number };
  }>) {
    paymentsByMethod[p.provider] = p._count._all;
  }

  return c.json({
    users: { total: totalUsers, last30DaysIncrease: newUsers30 },
    orders: {
      total: totalOrders,
      today: ordersToday,
      last30Days: [...dayMap.values()].map((d) => d.orders),
      pending: pendingOrders,
    },
    revenue: {
      totalTry: paidOrders.reduce(
        (sum: number, order: { totalAmount: unknown }) => sum + Number(order.totalAmount ?? 0),
        0,
      ),
      last30DaysTry: [...dayMap.values()].reduce((sum, day) => sum + day.revenue, 0),
      last30Days: [...dayMap.values()].map((d) => Number(d.revenue.toFixed(2))),
    },
    products: { active: activeProducts, lowStock: lowStockProducts },
    dealers: { pending: pendingDealers },
    paymentsByMethod,
    topProducts: topProducts.map((p: { productId: string; _sum: { quantity: number | null } }) => ({
      id: p.productId,
      title: productName.get(p.productId) ?? 'Bilinmeyen ürün',
      sold: p._sum.quantity ?? 0,
    })),
  });
});
