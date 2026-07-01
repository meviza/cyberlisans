import { NextRequest } from 'next/server';
import { forwardAdmin } from '../../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return forwardAdmin(req, '/admin/privacy/overview');
}
