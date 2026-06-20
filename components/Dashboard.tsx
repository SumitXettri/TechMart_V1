"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setUserEmail(data.user.email ?? null);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-lg">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white"
          >
            TechMart
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span>Welcome{userEmail ? `, ${userEmail}` : ""}</span>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-white px-4 py-2 text-slate-950 font-semibold transition hover:bg-slate-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.32em] text-sky-300">
            Dashboard
          </p>
          <h1 className="text-4xl font-bold text-white">
            Your seller dashboard
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            Manage auctions, view orders, and track performance from one place.
          </p>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Active listings",
              value: "8",
              description: "Products currently available for sale or auction.",
            },
            {
              title: "Pending orders",
              value: "4",
              description: "Orders waiting to be processed and shipped.",
            },
            {
              title: "Total earnings",
              value: "NPR 112,400",
              description: "Revenue from completed sales this month.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-lg shadow-slate-950/20"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                {card.title}
              </p>
              <p className="mt-4 text-3xl font-semibold text-white">
                {card.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {card.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Orders to ship</h2>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li className="rounded-3xl bg-slate-950/80 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Order #A0321</span>
                  <span className="text-sky-300">Preparing</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Smartwatch M2 — Ship today
                </p>
              </li>
              <li className="rounded-3xl bg-slate-950/80 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Order #A0318</span>
                  <span className="text-emerald-300">Confirmed</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Wireless earbuds — Awaiting payment
                </p>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">
              Recent activity
            </h2>
            <div className="mt-6 space-y-4 text-slate-300">
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-sm text-slate-400">New bid</p>
                <p className="mt-2 font-semibold text-white">
                  NPR 14,200 on Smartphone X13
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-sm text-slate-400">New review</p>
                <p className="mt-2 font-semibold text-white">
                  5-star rating on Laptop Z9
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
