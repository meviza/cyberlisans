import { NextRequest } from 'next/server';
import { forwardAdmin } from '../../../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return forwardAdmin(req, `/admin/privacy/export/${userId}`);
}
