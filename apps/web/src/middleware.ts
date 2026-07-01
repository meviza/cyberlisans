import { NextRequest, NextResponse } from 'next/server';

const REF_COOKIE_NAME = 'cl_ref';
const REF_TTL_DAYS = 30;
const REF_PATTERN = /^[a-zA-Z0-9_-]{3,60}$/;

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  let refCode: string | null = url.searchParams.get('ref');

  if (!refCode) {
    const pathRef = url.pathname.match(/^\/r\/([a-zA-Z0-9_-]{3,60})/);
    if (pathRef) refCode = pathRef[1] ?? null;
  }

  const response = NextResponse.next();
  const existing = request.cookies.get(REF_COOKIE_NAME)?.value;

  if (refCode && REF_PATTERN.test(refCode)) {
    if (refCode !== existing) {
      response.cookies.set(REF_COOKIE_NAME, refCode, {
        path: '/',
        maxAge: REF_TTL_DAYS * 24 * 60 * 60,
        sameSite: 'lax',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
      });
    }
    if (!url.searchParams.has('ref') && !url.pathname.startsWith('/r/')) {
      url.searchParams.set('ref', refCode);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

export function getRefCodeFromRequest(request: NextRequest): string | null {
  const url = request.nextUrl;
  const queryRef: string | null = url.searchParams.get('ref');
  if (queryRef && REF_PATTERN.test(queryRef)) return queryRef;
  const pathRef = url.pathname.match(/^\/r\/([a-zA-Z0-9_-]{3,60})/);
  if (pathRef) return pathRef[1] ?? null;
  const cookieRef = request.cookies.get(REF_COOKIE_NAME)?.value;
  if (cookieRef && REF_PATTERN.test(cookieRef)) return cookieRef;
  return null;
}
