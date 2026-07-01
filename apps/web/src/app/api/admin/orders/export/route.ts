import { NextRequest } from 'next/server';
import { forwardAdmin } from '../../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params: Record<string, string | undefined> = {};
  for (const key of [
    'search',
    'status',
    'paymentStatus',
    'paymentMethod',
    'currency',
    'from',
    'to',
  ]) {
    const v = url.searchParams.get(key);
    if (v) params[key] = v;
  }
  return forwardAdmin(req, '/admin/orders/export', { searchParams: params });
}
