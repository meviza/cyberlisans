import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Çıkış yapıldı' }, { status: 200 });
}
