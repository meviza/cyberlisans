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
import { ordersRoutes } from './interface/routes/orders';

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
app.route('/orders', ordersRoutes);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

const port = Number(process.env['PORT'] ?? 3001);

if (process.env['NODE_ENV'] !== 'test') {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`CyberLisans API running on http://localhost:${info.port}`);
  });
}

export default app;
