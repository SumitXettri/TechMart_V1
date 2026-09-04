"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Navbar from "./Navbar";

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-lg">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.32em] text-sky-300">
            Dashboard
          </p>
          <h1 className="text-4xl font-bold text-white">
            Your seller dashboard
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            Welcome{userEmail ? `, ${userEmail}` : ""}. Manage auctions, view
            orders, and track delivery from one place.
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

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-slate-950/20">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300">
                Delivery report
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Track your latest order
              </h2>
            </div>
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-200">
              Processing
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {["Payment confirmed", "Preparing", "Shipped", "Delivered"].map(
              (step, index) => (
                <div key={step} className="relative">
                  <div
                    className={`h-2 rounded-full ${index < 2 ? "bg-emerald-400" : "bg-slate-700"}`}
                  />
                  <p
                    className={`mt-3 text-sm ${index < 2 ? "text-white" : "text-slate-500"}`}
                  >
                    {step}
                  </p>
                  {index < 3 ? (
                    <span className="absolute right-0 top-0 hidden h-2 w-2 translate-x-1 rounded-full bg-slate-950 sm:block" />
                  ) : null}
                </div>
              ),
            )}
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Estimated delivery: within 2-4 business days after dispatch.
          </p>
        </section>
      </main>
    </div>
  );
}
