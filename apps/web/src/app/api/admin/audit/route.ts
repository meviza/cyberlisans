import { NextRequest } from 'next/server';
import { forwardAdmin } from '../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params: Record<string, string | undefined> = {
    page: url.searchParams.get('page') ?? '1',
    limit: url.searchParams.get('limit') ?? '50',
  };
  const search = url.searchParams.get('search');
  if (search) params['search'] = search;
  const action = url.searchParams.get('action');
  if (action) params['action'] = action;
  const actorId = url.searchParams.get('actorId');
  if (actorId) params['actorId'] = actorId;
  const targetUserId = url.searchParams.get('targetUserId');
  if (targetUserId) params['targetUserId'] = targetUserId;
  const targetType = url.searchParams.get('targetType');
  if (targetType) params['targetType'] = targetType;
  const from = url.searchParams.get('from');
  if (from) params['from'] = from;
  const to = url.searchParams.get('to');
  if (to) params['to'] = to;

  return forwardAdmin(req, '/admin/audit', { searchParams: params });
}
