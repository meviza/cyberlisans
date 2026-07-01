import { NextRequest } from 'next/server';
import { forwardDealer } from '../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return forwardDealer(req, '/dealer/me');
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return forwardDealer(req, '/dealer/me', { method: 'PATCH', body });
}
