import Link from "next/link";
import { RouteShell } from "./_components/route-shell";

const coreRoutes = [
  { href: "/auth/login", label: "Login" },
  { href: "/auth/register", label: "Register" },
  { href: "/account", label: "Account" },
  { href: "/orders", label: "Orders" },
  { href: "/search", label: "Search" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/auctions", label: "Auctions" },
  { href: "/admin", label: "Admin" },
];

const spotlightMetrics = [
  { label: "Routes shipped", value: "13" },
  { label: "API surfaces", value: "18" },
  { label: "Mock modules", value: "8" },
  { label: "Validation", value: "Lint + tests" },
];

const featuredSlices = [
  {
    title: "Commerce flows",
    description: "Browse products, manage cart and checkout, and review orders from a stable shell.",
    href: "/products",
  },
  {
    title: "Real-time auctions",
    description: "Open the live auction portal with skeleton loading, versioned bids, and countdowns.",
    href: "/auctions",
  },
  {
    title: "Operations center",
    description: "Jump into the gated admin dashboard for analytics, inventory, and auction telemetry.",
    href: "/admin",
  },
];

const workstreams = [
  {
    title: "Foundation",
    items: ["App shell", "Navigation", "Route scaffolds", "API health endpoint"],
  },
  {
    title: "Commerce",
    items: ["Authentication", "Catalogue browsing", "Cart", "Checkout", "Orders"],
  },
  {
    title: "Advanced",
    items: ["Auctions", "Search", "Loyalty", "Trade-in", "Store services"],
  },
  {
    title: "Operations",
    items: ["Admin dashboard", "Testing", "Analytics", "Launch readiness"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,173,51,0.16),_transparent_28%),linear-gradient(180deg,_#fff8ef_0%,_#f4f6fb_44%,_#eef2f7_100%)] px-4 py-6 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-slate-950/20">TM</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">TechMart</p>
              <p className="text-sm text-slate-500">B2C tech ecommerce platform</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
            {coreRoutes.map((route) => (
              <Link key={route.href} href={route.href} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                {route.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] md:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Implementation map</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Turn the master plan into working product slices.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                TechMart now has customer journeys, admin control surfaces, real-time auction flows, and schema hardening in place.
                The next steps are to tighten data persistence and connect the live surfaces end to end.
              </p>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {spotlightMetrics.map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-200/80">{metric.label}</p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-white">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/auctions" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50">
                Open live auctions
              </Link>
              <Link href="/admin" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10">
                View admin analytics
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {featuredSlices.map((slice) => (
              <Link
                key={slice.href}
                href={slice.href}
                className="group rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.1)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Featured slice</p>
                <h2 className="mt-2 text-xl font-black text-slate-950">{slice.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{slice.description}</p>
                <p className="mt-4 text-sm font-semibold text-slate-950 transition group-hover:translate-x-1">Open route →</p>
              </Link>
            ))}
          </div>
        </section>

        <RouteShell
          eyebrow="Delivery status"
          title="Current build surface"
          description="The app now exposes real route groups, mock data modules, API contracts, tests, CI, and Prisma-backed auth and auction logic."
        >
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Immediate backlog</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>Connect authentication sessions to protected account and admin workflows.</li>
                <li>Replace remaining mock data modules with Prisma-backed reads and writes.</li>
                <li>Expand auction updates into websocket or polling-driven live refreshes.</li>
                <li>Continue hardening admin analytics and launch readiness checks.</li>
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {workstreams.map((workstream) => (
                <div key={workstream.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h2 className="text-lg font-bold text-slate-950">{workstream.title}</h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {workstream.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}