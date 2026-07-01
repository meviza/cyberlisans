import { NextRequest } from 'next/server';
import { forwardAdmin } from '../../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardAdmin(req, `/admin/users/${id}`);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown = undefined;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return forwardAdmin(req, `/admin/users/${id}`, { method: 'PATCH', body });
}
