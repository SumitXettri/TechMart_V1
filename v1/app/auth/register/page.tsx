import { RouteShell } from "../../_components/route-shell";
import { authFactors } from "../../../lib/auth";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <RouteShell
          eyebrow="Authentication"
          title="Register"
          description="Registration scaffold for email verification, password rules, and future OAuth registration paths."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <form className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Full name
                  <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none ring-0 focus:border-teal-500" type="text" placeholder="Your name" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Email
                  <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none ring-0 focus:border-teal-500" type="email" placeholder="you@example.com" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Password
                  <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none ring-0 focus:border-teal-500" type="password" placeholder="At least 8 characters" />
                </label>
                <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Create account</button>
              </div>
            </form>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">Registration flow</p>
              <ul className="mt-3 space-y-2">
                {authFactors.map((factor) => (
                  <li key={factor} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}