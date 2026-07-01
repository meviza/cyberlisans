import { NextRequest } from 'next/server';
import { forwardAdmin } from '../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams: Record<string, string | undefined> = {
    page: url.searchParams.get('page') ?? '1',
    limit: url.searchParams.get('limit') ?? '20',
  };
  const search = url.searchParams.get('search');
  if (search) searchParams['search'] = search;
  const role = url.searchParams.get('role');
  if (role) searchParams['role'] = role;
  const status = url.searchParams.get('status');
  if (status) searchParams['status'] = status;
  const from = url.searchParams.get('from');
  if (from) searchParams['from'] = from;
  const to = url.searchParams.get('to');
  if (to) searchParams['to'] = to;

  return forwardAdmin(req, '/admin/users', { searchParams });
}
