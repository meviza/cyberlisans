import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { initSentry, bindSentryErrorHandler } from './instrument';
import { captureApiError } from './lib/sentry-helpers.ts';
import { authRoutes } from './interface/routes/auth';
import { profileRoutes } from './interface/routes/profile';
import { sessionRoutes } from './interface/routes/sessions';
import { walletRoutes } from './interface/routes/wallet';
import { paymentsRoutes } from './interface/routes/payments';
import { productsRoutes } from './interface/routes/products';
import { adminProductsRoutes } from './interface/routes/admin/products';
import { adminSellerProductsRoutes } from './interface/routes/admin/seller-products';
import { adminCategoriesRoutes } from './interface/routes/admin/categories';
import { adminBrandsRoutes } from './interface/routes/admin/brands';
import { adminUsersRoutes } from './interface/routes/admin/users';
import { adminOrdersRoutes } from './interface/routes/admin/orders';
import { adminPaymentsRoutes } from './interface/routes/admin/payments';
import { adminAuditRoutes } from './interface/routes/admin/audit';
import { adminPrivacyRoutes } from './interface/routes/admin/privacy';
import { adminSettingsRoutes } from './interface/routes/admin/settings';
import { adminStatsRoutes } from './interface/routes/admin/stats';
import { ordersRoutes } from './interface/routes/orders';
import { dealerRoutes } from './interface/routes/dealer';
import { dealerPublicRoutes } from './interface/routes/dealer-public';
import { adminDealersRoutes } from './interface/routes/admin/dealers';
import { sellerRoutes } from './interface/routes/sellers';
import { sellerProductsRoutes } from './interface/routes/seller-products';
import { adminSellersRoutes } from './interface/routes/admin/sellers';
import { adminSecretsRoutes } from './interface/routes/admin/secrets';
import { escrowRoutes } from './interface/routes/escrow';
import { payoutsRoutes } from './interface/routes/payouts';
import { disputesRoutes } from './interface/routes/disputes';
import { adminEscrowRoutes } from './interface/routes/admin/escrow';
import { internalRoutes } from './interface/routes/internal';
import { createCorsMiddleware } from './interface/middleware/cors';
import { honoSecureHeaders, securityHeaders } from './interface/middleware/security-headers';
import { errorHandler } from './interface/middleware/error-handler';
import { createRateLimiter, RATE_LIMIT_CONFIGS } from './interface/middleware/security/rate-limit';

export const app = new Hono();

initSentry();
bindSentryErrorHandler(app);

app.use('*', logger());
app.use('*', honoSecureHeaders());
app.use('*', securityHeaders());
app.use('*', createCorsMiddleware());

app.use(
  '*',
  createRateLimiter({
    config: { ...RATE_LIMIT_CONFIGS.api, keyPrefix: 'rl:global' },
  }),
);

app.onError(async (err, c) => {
  const status =
    (err as { statusCode?: number; status?: number }).statusCode ??
    (err as { status?: number }).status ??
    500;
  if (status >= 500) {
    captureApiError(err, {
      route: c.req.path,
      method: c.req.method,
      statusCode: status,
    });
    const { Sentry } = await import('./instrument');
    await Sentry.flush(2000);
  }
  return errorHandler(err, c);
});

app.get('/', (c) => c.json({ name: 'CyberLisans API', version: '0.1.0', status: 'ok' }));
app.get('/health', (c) => c.json({ status: 'healthy', timestamp: new Date().toISOString() }));

app.get('/debug/env', (c) => {
  const keys = Object.keys(process.env).filter(
    (k) =>
      k.startsWith('SUPABASE_') ||
      k.startsWith('INTERNAL_') ||
      k === 'JWT_SECRET' ||
      k === 'NODE_ENV',
  );
  const obj: Record<string, unknown> = { count: keys.length, keys };
  for (const k of keys) {
    const v = process.env[k];
    obj[k] = v ? `<set len=${(v as string).length}>` : '<empty>';
  }
  return c.json(obj);
});

app.get('/debug/db', async (c) => {
  try {
    const { supabaseAdmin } = await import('./infrastructure/db');
    const { data, error } = await supabaseAdmin().from('users').select('id').limit(1);
    if (error) throw error;
    return c.json({ ok: true, info: { reachable: true, sampleRows: (data ?? []).length } });
  } catch (e) {
    return c.json(
      { ok: false, error: (e as Error).message, code: (e as { code?: string }).code },
      500,
    );
  }
});

app.route('/auth', authRoutes);
app.route('/profile', profileRoutes);
app.route('/sessions', sessionRoutes);
app.route('/wallet', walletRoutes);
app.route('/payments', paymentsRoutes);
app.route('/products', productsRoutes);
app.route('/admin/products', adminSellerProductsRoutes);
app.route('/admin/products', adminProductsRoutes);
app.route('/admin/categories', adminCategoriesRoutes);
app.route('/admin/brands', adminBrandsRoutes);
app.route('/admin/users', adminUsersRoutes);
app.route('/admin/orders', adminOrdersRoutes);
app.route('/admin/payments', adminPaymentsRoutes);
app.route('/admin/audit', adminAuditRoutes);
app.route('/admin/privacy', adminPrivacyRoutes);
app.route('/admin/settings', adminSettingsRoutes);
app.route('/admin/stats', adminStatsRoutes);
app.route('/orders', ordersRoutes);
app.route('/dealer', dealerRoutes);
app.route('/dealer-public', dealerPublicRoutes);
app.route('/admin/dealers', adminDealersRoutes);
app.route('/sellers', sellerRoutes);
app.route('/seller/products', sellerProductsRoutes);
app.route('/admin/sellers', adminSellersRoutes);
app.route('/admin/secrets', adminSecretsRoutes);
app.route('/escrow', escrowRoutes);
app.route('/payouts', payoutsRoutes);
app.route('/disputes', disputesRoutes);
app.route('/admin/escrow', adminEscrowRoutes);
app.route('/internal', internalRoutes);

app.notFound((c) => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404));

export default app;
