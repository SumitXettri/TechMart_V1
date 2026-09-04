import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabaseAdmin";

/**
 * lib/auth.ts
 * Signed, HTTP-only JWT session cookie for admin authentication.
 */

const SESSION_SECRET = process.env.SESSION_SECRET || "";
const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "techmart_admin_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

export interface SessionPayload {
  sub: string; // user id
  email: string;
  role: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

function assertSecretConfigured() {
  if (!SESSION_SECRET || SESSION_SECRET.length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short. It must be at least 16 characters.",
    );
  }
}

export function createSessionToken(payload: SessionPayload): string {
  assertSecretConfigured();
  return jwt.sign(payload, SESSION_SECRET, {
    algorithm: "HS256",
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  assertSecretConfigured();
  try {
    return jwt.verify(token, SESSION_SECRET, {
      algorithms: ["HS256"],
    }) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function createSession(payload: SessionPayload) {
  await setSessionCookie(createSessionToken(payload));
}

export async function destroySession() {
  await clearSessionCookie();
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * requireAdmin():
 * 1. Reads the session cookie.
 * 2. Verifies the JWT signature and expiry.
 * 3. Re-queries `users` by the session subject (source of truth for role,
 *    so a demoted/deleted user is rejected even with a still-valid token).
 * 4. Rejects missing users with 401, non-ADMIN users with 403.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    throw new AuthError("Not authenticated.", 401);
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    throw new AuthError("Session is invalid or has expired.", 401);
  }

  if (!supabaseAdmin) {
    throw new AuthError("Server auth is not configured.", 500);
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", payload.sub)
    .single();

  if (error || !data) {
    throw new AuthError("Session user no longer exists.", 401);
  }

  if (data.role !== "ADMIN") {
    throw new AuthError("Admin privileges are required.", 403);
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
  };
}

export { SESSION_COOKIE_NAME };
