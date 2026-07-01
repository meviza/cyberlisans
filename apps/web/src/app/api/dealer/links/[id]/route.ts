import { NextRequest } from 'next/server';
import { forwardDealer } from '../../_forward';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardDealer(req, `/dealer/links/${id}`);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return forwardDealer(req, `/dealer/links/${id}`, { method: 'PATCH', body });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardDealer(req, `/dealer/links/${id}`, { method: 'DELETE' });
}
