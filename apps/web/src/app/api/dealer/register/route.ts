import { NextRequest } from 'next/server';
import { forwardDealer } from '../_forward';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return forwardDealer(req, '/dealer/register', { method: 'POST', body });
}
