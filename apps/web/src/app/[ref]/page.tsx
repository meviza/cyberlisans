import { notFound, redirect } from 'next/navigation';

// Whitelist: en az bir rakam icermeli. Boylece /about, /help, /foo gibi
// yaygin route adlari dealer code olarak yorumlanmaz. Gercek dealer kodlari
// uretildiginde random alphanumeric/hex icerir.
const REF_PATTERN = /^(?=.*[0-9])[A-Za-z0-9_-]{6,40}$/;
const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

interface ResolveResponse {
  code: string;
  dealerId: string;
  productId: string | null;
  productSlug?: string;
  discountPercent: number;
  isActive: boolean;
  expiresAt: string | null;
}

export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref: code } = await params;

  if (!code || !REF_PATTERN.test(code)) {
    notFound();
  }

  // Cookie islemi middleware.ts tarafindan yapiliyor; burada yapmiyoruz
  // cunku Server Component prerender context'inde cookies() set edilemez.
  let resolved: ResolveResponse | null = null;
  try {
    const res = await fetch(`${API_URL}/dealer-public/resolve/${encodeURIComponent(code)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      resolved = (await res.json()) as ResolveResponse;
    }
  } catch {
    resolved = null;
  }

  if (!resolved || !resolved.isActive) {
    redirect(`/products?ref=${encodeURIComponent(code)}`);
  }

  const targetPath = resolved.productSlug ? `/products/${resolved.productSlug}` : '/products';
  redirect(`${targetPath}?ref=${encodeURIComponent(code)}&discount=${resolved.discountPercent}`);
}
