import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';
const REF_COOKIE = 'cl_ref';
const REF_TTL = 60 * 60 * 24 * 30;

const RESERVED = new Set([
  'api',
  '_next',
  'admin',
  'dealer',
  'dashboard',
  'cart',
  'checkout',
  'products',
  'legal',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'verify-email',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'icon',
  'opengraph-image',
  'apple-icon',
  'llms.txt',
]);

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
  if (!code || RESERVED.has(code)) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get(REF_COOKIE)?.value;
  if (existing !== code) {
    cookieStore.set(REF_COOKIE, code, {
      path: '/',
      maxAge: REF_TTL,
      sameSite: 'lax',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  let resolved: ResolveResponse | null = null;
  try {
    const res = await fetch(`${API_URL}/dealer-public/resolve/${encodeURIComponent(code)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      resolved = (await res.json()) as ResolveResponse;
    }
  } catch {}

  if (!resolved || !resolved.isActive) {
    redirect('/products?ref=' + encodeURIComponent(code));
  }

  const targetPath = resolved.productSlug ? `/products/${resolved.productSlug}` : '/products';
  const url = `${targetPath}?ref=${encodeURIComponent(code)}&discount=${resolved.discountPercent}`;
  redirect(url);
}
