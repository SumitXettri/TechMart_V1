import { cookies, headers } from 'next/headers';

export function getServerCookie(name: string): string | null {
  try {
    const ck = cookies();
    if (ck && typeof (ck as unknown as { get?: unknown }).get === 'function') {
      return (ck as { get: (n: string) => { value?: string } | undefined }).get(name)?.value ?? null;
    }

    const header = headers().get('cookie') ?? '';
    const match = header.split(';').map((s) => s.trim()).find((s) => s.startsWith(name + '='));
    return match ? match.split('=')[1] : null;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((pair) => {
    const [k, ...rest] = pair.split('=');
    if (!k) return;
    out[k.trim()] = decodeURIComponent((rest || []).join('=').trim());
  });
  return out;
}

export default getServerCookie;
