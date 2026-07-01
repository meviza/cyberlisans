import { NextRequest, NextResponse } from 'next/server';
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
  const provider = url.searchParams.get('provider');
  if (provider) params['provider'] = provider;
  const status = url.searchParams.get('status');
  if (status) params['status'] = status;
  const currency = url.searchParams.get('currency');
  if (currency) params['currency'] = currency;
  const from = url.searchParams.get('from');
  if (from) params['from'] = from;
  const to = url.searchParams.get('to');
  if (to) params['to'] = to;
  const sort = url.searchParams.get('sort');
  if (sort) params['sort'] = sort;
  const order = url.searchParams.get('order');
  if (order) params['order'] = order;

  return forwardAdmin(req, '/admin/payments', { searchParams: params });
}
