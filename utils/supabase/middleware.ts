import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  // Note: using the plain supabase client here. If you need cookie-bound
  // server helpers (for auth), install @supabase/auth-helpers-nextjs and
  // switch to `createServerClient`.
  const supabase = createSupabaseClient(supabaseUrl!, supabaseKey!);

  const cookiesHandler = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      supabaseResponse = NextResponse.next({
        request,
      });
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options),
      );
    },
  };

  return supabaseResponse;
};
