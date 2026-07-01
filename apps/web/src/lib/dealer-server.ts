import { headers } from 'next/headers';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export async function getAuthHeader(): Promise<string | null> {
  const hdrs = await headers();
  return hdrs.get('authorization');
}

export async function dealerServerFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T | null> {
  const auth = await getAuthHeader();
  if (!auth) return null;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
