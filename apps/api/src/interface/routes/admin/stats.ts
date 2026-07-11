import { Hono } from 'hono';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { supabaseAdmin, dbError } from '../../../infrastructure/db';

export const adminStatsRoutes = new Hono();

adminStatsRoutes.use('*', ...createAdminStack());

adminStatsRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
});

function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function countRows(query: any): Promise<number> {
  const { count, error } = await query;
  if (error) {
    if (String(error.message || '').includes('does not exist')) return 0;
    throw dbError(error);
  }
  return count ?? 0;
}

adminStatsRoutes.get('/', async (c) => {
  const db = supabaseAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from30 = new Date(today);
  from30.setDate(today.getDate() - 29);
  const from30Iso = from30.toISOString();
  const todayIso = today.toISOString();

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
    pendingOrders,
    lowStockProducts,
    pendingDealers,
    pendingSellers,
  ] = await Promise.all([
    countRows(db.from('users').select('*', { count: 'exact', head: true })),
    countRows(
      db.from('users').select('*', { count: 'exact', head: true }).gte('createdAt', from30Iso),
    ),
    countRows(db.from('orders').select('*', { count: 'exact', head: true })),
    countRows(
      db.from('orders').select('*', { count: 'exact', head: true }).gte('createdAt', todayIso),
    ),
    countRows(db.from('products').select('*', { count: 'exact', head: true }).eq('isActive', true)),
    countRows(
      db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    ),
    countRows(
      db
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('isActive', true)
        .lte('stock', 10),
    ),
    countRows(
      db
        .from('dealer_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING'),
    ),
    countRows(
      db.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    ),
  ]);

  const { data: paidOrders, error: paidErr } = await db
    .from('orders')
    .select('createdAt,totalAmount,status')
    .in('status', ['PAID', 'FULFILLED']);
  if (paidErr) throw dbError(paidErr);

  let totalTry = 0;
  for (const order of paidOrders ?? []) {
    const amount = Number((order as { totalAmount: unknown }).totalAmount ?? 0);
    totalTry += amount;
    const key = dayKey((order as { createdAt: string }).createdAt);
    const row = dayMap.get(key);
    if (row) {
      row.orders += 1;
      row.revenue += amount;
    }
  }

  const paymentsByMethod: Record<string, number> = {
    WALLET: 0,
    PAYTR: 0,
    PAPARA: 0,
    STRIPE: 0,
    NOWPAYMENTS: 0,
    BANK_TRANSFER: 0,
  };
  const { data: payments } = await db.from('payments').select('provider');
  for (const p of payments ?? []) {
    const provider = String((p as { provider: string }).provider || '').toUpperCase();
    if (provider in paymentsByMethod) paymentsByMethod[provider]! += 1;
  }

  const { data: items, error: itemsErr } = await db
    .from('order_items')
    .select('productId,quantity');
  if (itemsErr) throw dbError(itemsErr);

  const soldMap = new Map<string, number>();
  for (const it of items ?? []) {
    const pid = (it as { productId: string }).productId;
    const qty = Number((it as { quantity: number }).quantity ?? 0);
    soldMap.set(pid, (soldMap.get(pid) ?? 0) + qty);
  }
  const topIds = [...soldMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let titleMap = new Map<string, string>();
  if (topIds.length > 0) {
    const { data: products, error: pErr } = await db
      .from('products')
      .select('id,title')
      .in('id', topIds);
    if (pErr) throw dbError(pErr);
    titleMap = new Map(
      (products ?? []).map((p) => [(p as { id: string }).id, (p as { title: string }).title]),
    );
  }

  const dayValues = [...dayMap.values()];

  return c.json({
    users: { total: totalUsers, last30DaysIncrease: newUsers30 },
    orders: {
      total: totalOrders,
      today: ordersToday,
      last30Days: dayValues.map((d) => d.orders),
      pending: pendingOrders,
    },
    revenue: {
      totalTry,
      last30DaysTry: dayValues.reduce((sum, day) => sum + day.revenue, 0),
      last30Days: dayValues.map((d) => Number(d.revenue.toFixed(2))),
    },
    products: { active: activeProducts, lowStock: lowStockProducts },
    dealers: { pending: pendingDealers },
    sellers: { pending: pendingSellers },
    paymentsByMethod,
    topProducts: topIds.map((id) => ({
      id,
      title: titleMap.get(id) ?? 'Bilinmeyen ürün',
      sold: soldMap.get(id) ?? 0,
    })),
  });
});
