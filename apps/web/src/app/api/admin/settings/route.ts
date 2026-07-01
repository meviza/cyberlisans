import { NextRequest } from 'next/server';
import { forwardAdmin } from '../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return forwardAdmin(req, '/admin/settings');
}

export async function PATCH(req: NextRequest) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return forwardAdmin(req, '/admin/settings', { method: 'PATCH', body });
}
