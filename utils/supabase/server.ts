import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) => {
  // For cookie-aware server helpers, consider installing
  // `@supabase/auth-helpers-nextjs` and using `createServerClient`.
  const client = createSupabaseClient(supabaseUrl!, supabaseKey!);

  const cookiesHandler = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(
      cookiesToSet: Array<{ name: string; value: string; options?: any }>,
    ) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      } catch {
        // The `setAll` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
      }
    },
  };

  return client;
};
