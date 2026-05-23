import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip static and Next internals to avoid noise
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api/v1/metrics/record") ||
    pathname.startsWith("/api/v1/logs")
  ) {
    return NextResponse.next();
  }

  try {
    // Fire-and-forget POST to our metrics record endpoint so the runtime counts requests.
    // Keep errors silent to avoid impacting request handling.
    void fetch(new URL("/api/v1/metrics/record", url).toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname, method: request.method }),
      // no credentials
    }).catch(() => undefined);
  } catch (err) {
    // Best-effort: POST a minimal error to the server-side logging endpoint
    try {
      const headers = Object.fromEntries(request.headers.entries());
      const cookieHeader = request.headers.get('cookie') || '';
      const tm = cookieHeader.split(/;\s*/).find((c) => c.startsWith('tm_session=')) || '';
      const tmToken = tm ? tm.split('=').slice(1).join('=') : '';
      const tmShort = tmToken ? tmToken.slice(0, 12) : '';

      const payload = {
        message: String(err?.message ?? 'middleware error'),
        stack: err?.stack,
        pathname,
        method: request.method,
        headers: {
          'user-agent': headers['user-agent'],
          referer: headers.referer || headers.referrer,
          'accept-language': headers['accept-language'],
        },
        tm_session_short: tmShort,
        tm_session: tmToken,
        forwarded_for: headers['x-forwarded-for'] || headers['x-real-ip'] || null,
      };

      void fetch(new URL('/api/v1/logs', url).toString(), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!static|_next|favicon.ico).*)",
};
