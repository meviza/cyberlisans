import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
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
import { ordersRoutes } from './interface/routes/orders';
import { dealerRoutes } from './interface/routes/dealer';
import { dealerPublicRoutes } from './interface/routes/dealer-public';
import { adminDealersRoutes } from './interface/routes/admin/dealers';

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

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
app.route('/orders', ordersRoutes);
app.route('/dealer', dealerRoutes);
app.route('/dealer-public', dealerPublicRoutes);
app.route('/admin/dealers', adminDealersRoutes);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

const port = Number(process.env['PORT'] ?? 3001);

if (process.env['NODE_ENV'] !== 'test') {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`CyberLisans API running on http://localhost:${info.port}`);
  });
}

export default app;
