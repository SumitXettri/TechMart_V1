"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      mounted = false;
      try {
        listener?.subscription?.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl flex-wrap items-center gap-4 px-5 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-xl font-black tracking-tight text-white" aria-label="TechMart home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-sm text-slate-950" aria-hidden="true">T</span>
          TechMart
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm font-medium text-slate-200 sm:order-2 sm:ml-auto sm:w-auto" aria-label="Main navigation">
          {[
            ["/", "Home"],
            ["/products", "Products"],
            ["/auctions", "Auctions"],
            ["/dashboard", "Dashboard"],
            ["/checkout", "Checkout"],
          ].map(([href, label]) => {
            const active = pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));
            return <Link key={href} href={href} className={`whitespace-nowrap rounded-lg px-3 py-2 transition ${active ? "bg-white/15 font-bold text-white" : "hover:bg-white/10 hover:text-white"}`}>{label}</Link>;
          })}

          <Link
            href="/admin/login"
            className="rounded-full border border-teal-300/60 px-3 py-1.5 font-bold text-teal-100 transition hover:border-teal-200 hover:bg-teal-400/15 hover:text-white"
          >
            Admin
          </Link>

          {loading ? (
            <span className="text-sm text-slate-300">Checking...</span>
          ) : user ? (
            <div className="flex items-center gap-3 sm:order-3">
              <span className="hidden max-w-40 truncate text-sm text-slate-200 lg:block">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="rounded-full bg-white px-4 py-2 text-slate-950 font-semibold transition hover:bg-slate-200"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:order-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white font-semibold"
              >
                Sign in
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
