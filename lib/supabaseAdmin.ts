import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * lib/supabaseAdmin.ts
 * Server-only Supabase client using the service-role key.
 * This bypasses Row Level Security — NEVER import this file from
 * client components, and never expose the service-role key in a
 * NEXT_PUBLIC_* variable in production.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  "";

let client: SupabaseClient | null = null;

if (url && serviceKey) {
  client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} else if (typeof window === "undefined") {
  // Only warn server-side; avoids leaking config state to the browser bundle.
  console.warn(
    "[supabaseAdmin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Supabase fallback paths will be unavailable.",
  );
}

export const supabaseAdmin = client;

export function isSupabaseConfigured(): boolean {
  return client !== null;
}
