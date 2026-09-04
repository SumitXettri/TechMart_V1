/**
 * lib/csrf.ts
 * Same-origin check for mutating admin routes. Called after requireAdmin()
 * so it never leaks information to unauthenticated callers.
 */
export function isSameOrigin(request: Request): boolean {
  const url = new URL(request.url);
  const expectedOrigin = url.origin;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    return origin === expectedOrigin;
  }

  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  // Missing both headers: allow same-origin server-side/tool requests.
  return true;
}

export function csrfRejectionResponse() {
  return Response.json({ error: "Invalid request origin" }, { status: 403 });
}
