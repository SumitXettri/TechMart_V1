"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach the admin login service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#123d3a] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[36px] border-amber-300/20" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border-[46px] border-teal-300/10" />

          <div className="relative">
            <div className="flex items-center gap-3 text-lg font-black tracking-tight">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                T
              </span>
              TechMart
            </div>
            <div className="mt-24 max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
                Operations workspace
              </p>
              <h2 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
                Run the marketplace with clarity.
              </h2>
              <p className="mt-6 max-w-sm text-base leading-7 text-teal-50/75">
                Manage products, auctions, customers, shipments, and activity reports from one focused workspace.
              </p>
            </div>
          </div>

          <div className="relative grid max-w-md grid-cols-3 gap-3 border-t border-white/15 pt-6 text-sm">
            <div><p className="font-bold text-amber-300">Catalog</p><p className="mt-1 text-teal-50/60">Products</p></div>
            <div><p className="font-bold text-amber-300">Delivery</p><p className="mt-1 text-teal-50/60">Tracking</p></div>
            <div><p className="font-bold text-amber-300">Reports</p><p className="mt-1 text-teal-50/60">Live data</p></div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-14 xl:px-24">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 font-black text-slate-950">T</span>
              <span className="text-xl font-black">TechMart <span className="font-medium text-teal-700">Admin</span></span>
            </div>

            <div className="mb-9">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Admin portal</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Welcome back.</h1>
              <p className="mt-4 text-base leading-7 text-slate-500">Sign in to continue managing your TechMart operations.</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.45)] sm:p-8">
              {error && (
                <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Admin email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                  placeholder="admin@techmart.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Authenticating..." : "Sign in to dashboard"}
                {!loading && <span aria-hidden="true">-&gt;</span>}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">Authorized TechMart administrators only.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
