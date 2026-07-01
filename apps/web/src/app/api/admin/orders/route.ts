import { NextRequest } from 'next/server';
import { forwardAdmin } from '../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params: Record<string, string | undefined> = {
    page: url.searchParams.get('page') ?? '1',
    limit: url.searchParams.get('limit') ?? '20',
  };
  const search = url.searchParams.get('search');
  if (search) params['search'] = search;
  const status = url.searchParams.get('status');
  if (status) params['status'] = status;
  const ps = url.searchParams.get('paymentStatus');
  if (ps) params['paymentStatus'] = ps;
  const pm = url.searchParams.get('paymentMethod');
  if (pm) params['paymentMethod'] = pm;
  const cur = url.searchParams.get('currency');
  if (cur) params['currency'] = cur;
  const from = url.searchParams.get('from');
  if (from) params['from'] = from;
  const to = url.searchParams.get('to');
  if (to) params['to'] = to;

  return forwardAdmin(req, '/admin/orders', { searchParams: params });
}
