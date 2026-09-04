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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f5] text-slate-950">
        <p className="text-lg font-semibold">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.32em] text-teal-700">
            Dashboard
          </p>
          <h1 className="text-4xl font-black text-slate-950">
            Your seller dashboard
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-500">
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
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
                {card.title}
              </p>
              <p className="mt-4 text-3xl font-black text-slate-950">
                {card.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {card.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Orders to ship
            </h2>
            <ul className="mt-6 space-y-4 text-slate-600">
              <li className="rounded-2xl bg-[#f1f5f0] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Order #A0321</span>
                  <span className="font-semibold text-amber-700">
                    Preparing
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Smartwatch M2 — Ship today
                </p>
              </li>
              <li className="rounded-2xl bg-[#f1f5f0] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Order #A0318</span>
                  <span className="font-semibold text-emerald-700">
                    Confirmed
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Wireless earbuds — Awaiting payment
                </p>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Recent activity
            </h2>
            <div className="mt-6 space-y-4 text-slate-600">
              <div className="rounded-2xl bg-[#f1f5f0] p-4">
                <p className="text-sm text-slate-400">New bid</p>
                <p className="mt-2 font-semibold text-slate-950">
                  NPR 14,200 on Smartphone X13
                </p>
              </div>
              <div className="rounded-2xl bg-[#f1f5f0] p-4">
                <p className="text-sm text-slate-400">New review</p>
                <p className="mt-2 font-semibold text-slate-950">
                  5-star rating on Laptop Z9
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
                Delivery report
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">
                Track your latest order
              </h2>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
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
                    className={`mt-3 text-sm ${index < 2 ? "font-semibold text-slate-950" : "text-slate-500"}`}
                  >
                    {step}
                  </p>
                  {index < 3 ? (
                    <span className="absolute right-0 top-0 hidden h-2 w-2 translate-x-1 rounded-full bg-white sm:block" />
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
