"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <header className="border-b border-white/10 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          TechMart
        </Link>

        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link href="/" className="hover:text-white">
            Home
          </Link>

          <Link href="/auctions" className="hover:text-white">
            Auctions
          </Link>

          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>

          <Link href="/checkout" className="hover:text-white">
            Checkout
          </Link>

          <Link href="/create-auction" className="hover:text-white">
            Create auction
          </Link>

          <Link href="/auctions" className="hover:text-white">
            Auctions
          </Link>

          {loading ? (
            <span className="text-sm text-slate-400">Checking...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-200">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="rounded-full bg-white px-4 py-2 text-slate-950 font-semibold transition hover:bg-slate-200"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
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
