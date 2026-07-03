import { serve } from '@hono/node-server';
import app from './app.js';

const port = Number(process.env['PORT'] ?? 3001);

if (process.env['NODE_ENV'] !== 'test') {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`CyberLisans API running on http://localhost:${info.port}`);
  });
}

export { app };
export default app;
