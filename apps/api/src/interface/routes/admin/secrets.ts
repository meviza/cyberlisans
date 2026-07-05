import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, requireAdmin } from '../../../infrastructure/auth';
import { supabaseAdmin } from '../../../infrastructure/supabase-db';
import { ALLOWED_SECRET_NAMES } from './allowed-secrets';

export const adminSecretsRoutes = new Hono();

adminSecretsRoutes.use('*', authMiddleware);
adminSecretsRoutes.use('*', requireAdmin());

adminSecretsRoutes.get('/', async (c) => {
  const { data, error } = await supabaseAdmin()
    .from('app_secrets')
    .select('id, name, rotation_count, last_rotated_at, last_rotated_by, expires_at, metadata')
    .order('last_rotated_at', { ascending: false });

  if (error) return c.json({ error: error.message, code: 'DB_ERROR' }, 500);
  return c.json({ secrets: data });
});

adminSecretsRoutes.get(
  '/:name/value',
  zValidator('param', z.object({ name: z.enum(ALLOWED_SECRET_NAMES) })),
  async (c) => {
    const { name } = c.req.valid('param');
    const { data, error } = await supabaseAdmin().rpc('get_app_secret', { p_name: name });
    if (error || !data) {
      return c.json({ error: 'Not found or decryption failed', code: 'NOT_FOUND' }, 404);
    }
    return c.json({ name, value: data });
  },
);

adminSecretsRoutes.get(
  '/:name/log',
  zValidator('param', z.object({ name: z.enum(ALLOWED_SECRET_NAMES) })),
  async (c) => {
    const { name } = c.req.valid('param');
    const { data, error } = await supabaseAdmin()
      .from('secret_rotation_log')
      .select('*')
      .eq('secret_name', name)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return c.json({ error: error.message, code: 'DB_ERROR' }, 500);
    return c.json({ logs: data });
  },
);

adminSecretsRoutes.delete(
  '/:name',
  zValidator('param', z.object({ name: z.enum(ALLOWED_SECRET_NAMES) })),
  async (c) => {
    const admin = c.get('user');
    const { name } = c.req.valid('param');

    const { error } = await supabaseAdmin().from('app_secrets').delete().eq('name', name);

    await supabaseAdmin()
      .from('secret_rotation_log')
      .insert({
        secret_name: name,
        action: 'DELETED',
        actor: `admin:${admin.sub}`,
        actor_id: admin.sub,
        metadata: { deleted_at: new Date().toISOString() },
      });

    if (error) return c.json({ error: error.message, code: 'DB_ERROR' }, 500);
    return c.json({ ok: true, name });
  },
);
