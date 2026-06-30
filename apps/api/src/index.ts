import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/', (c) => c.json({ name: 'CyberLisans API', status: 'ok' }));
app.get('/health', (c) => c.json({ status: 'healthy' }));

const port = Number(process.env['PORT'] ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`CyberLisans API running on http://localhost:${info.port}`);
});
