import { NextResponse } from "next/server";
import { initSentry, captureException } from "../../../../lib/sentry";
import { rateAllowed as redisRateAllowed } from "@/lib/rateLimiter";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

type LogPayload = {
  message?: string;
  stack?: string;
  pathname?: string;
  method?: string;
  headers?: Record<string, string | undefined> | null;
  tm_session_short?: string;
  forwarded_for?: string | null;
  tm_session?: string | null;
};

export async function POST(request: Request) {
  initSentry();
  try {
    const body = (await request.json().catch(() => ({}))) as LogPayload;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const key = `${ip}:${body.tm_session_short ?? 'anon'}`;

    // Use the shared rate limiter (it will use Redis if configured, otherwise an in-memory fallback).
    const allowed = await redisRateAllowed(key, Number(process.env.RATE_LIMIT_MAX ?? 120), Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000));
    if (!allowed) {
      return NextResponse.json({ success: false, message: 'rate_limited' }, { status: 429 });
    }

    const { message, stack, pathname, method, headers, tm_session_short, tm_session, forwarded_for } = body as any;
    const err = new Error(message || 'middleware error');
    if (stack) (err as Error & { stack?: string }).stack = stack;

    const context: Record<string, unknown> = { ip, pathname, method, headers, tm_session_short, forwarded_for };

    if (tm_session) {
      // Never send full session token to Sentry. Decode to extract minimal user info if possible,
      // and include a short hashed fingerprint of the token for correlation.
      try {
        const secret = process.env.JWT_SECRET || 'dev-jwt-secret';
        const payload = jwt.verify(tm_session as string, secret) as Record<string, unknown>;
        context.user = { id: payload.sub ?? payload['id'], email: payload.email ?? payload['email'], role: payload.role ?? payload['role'] };
      } catch {
        context.user = { token_invalid: true };
      }

      try {
        const hash = crypto.createHash('sha256').update(tm_session).digest('hex').slice(0, 8);
        context.session_hash = hash;
      } catch {}
    }

    try {
      captureException({ error: err, context });
    } catch {}

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
