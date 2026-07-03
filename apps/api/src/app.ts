import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { authRoutes } from './interface/routes/auth';
import { profileRoutes } from './interface/routes/profile';
import { sessionRoutes } from './interface/routes/sessions';
import { walletRoutes } from './interface/routes/wallet';
import { paymentsRoutes } from './interface/routes/payments';
import { productsRoutes } from './interface/routes/products';
import { adminProductsRoutes } from './interface/routes/admin/products';
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
import { adminSellersRoutes } from './interface/routes/admin/sellers';
import { createCorsMiddleware } from './interface/middleware/cors';
import { honoSecureHeaders, securityHeaders } from './interface/middleware/security-headers';
import { errorHandler } from './interface/middleware/error-handler';
import { createRateLimiter, RATE_LIMIT_CONFIGS } from './interface/middleware/security/rate-limit';

export const app = new Hono();

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

app.onError((err, c) => errorHandler(err, c));

app.get('/', (c) => c.json({ name: 'CyberLisans API', version: '0.1.0', status: 'ok' }));
app.get('/health', (c) => c.json({ status: 'healthy', timestamp: new Date().toISOString() }));

app.route('/auth', authRoutes);
app.route('/profile', profileRoutes);
app.route('/sessions', sessionRoutes);
app.route('/wallet', walletRoutes);
app.route('/payments', paymentsRoutes);
app.route('/products', productsRoutes);
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
app.route('/admin/sellers', adminSellersRoutes);

app.notFound((c) => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404));

export default app;
