import { RouteShell } from "../_components/route-shell";
import { getServerCookie } from "../../lib/serverCookies";
import jwt from "jsonwebtoken";
import {
  adminAnalytics,
  adminAlerts,
  adminOperations,
  adminQuickActions,
  inventoryRows,
  liveAuctionRows,
} from "../../lib/admin";

export default function AdminPage() {
  const cookie = getServerCookie('tm_session');
  let isAdmin = false;
  if (cookie) {
    try {
      const secret = process.env.JWT_SECRET ?? 'dev-jwt-secret';
      const payload = jwt.verify(cookie, secret) as { role?: string };
      if (payload?.role === 'admin') isAdmin = true;
    } catch {
      isAdmin = false;
    }
  }

  const panels = [
    {
      title: "Inventory management",
      items: ["Add/edit products", "Bulk import/export", "Low stock alerts", "Variant control"],
    },
    {
      title: "Order management",
      items: ["Status transitions", "Refund initiation", "Tracking updates", "Packing slips"],
    },
    {
      title: "Auction operations",
      items: ["Create auctions", "Extend end times", "Cancel with reason", "Live bid dashboard"],
    },
    {
      title: "Analytics",
      items: ["Revenue overview", "Top products", "Auction performance", "Inventory alerts"],
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <RouteShell
          eyebrow="Admin"
          title="Admin dashboard"
          description="Operational dashboard starter for inventory, orders, auctions, analytics, and role-based access control."
        >
          {!isAdmin ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-lg font-semibold">Admin access required</p>
              <p className="mt-2 text-sm text-slate-600">Sign in with an administrator account to view this dashboard.</p>
            </div>
          ) : null}
          {isAdmin ? (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {adminAnalytics.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-slate-950 p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{stat.label}</p>
                    <p className="mt-2 text-3xl font-black">{stat.value}</p>
                    <p className={`mt-2 text-xs font-semibold ${stat.tone === 'negative' ? 'text-rose-300' : 'text-emerald-300'}`}>{stat.delta}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {panels.map((panel) => (
                  <div key={panel.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h2 className="text-lg font-bold text-slate-950">{panel.title}</h2>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {panel.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Live auction telemetry</p>
                  <div className="mt-4 space-y-3">
                    {liveAuctionRows.map((row) => (
                      <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 text-sm text-slate-600">
                        <div>
                          <p className="font-semibold text-slate-950">{row.item}</p>
                          <p>{row.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-950">Rs. {row.highBid.toLocaleString()}</p>
                          <p>{row.bids} bids · {row.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">System health</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    {adminOperations.map((row) => (
                      <div key={row.label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                        <span>{row.label}</span>
                        <span className="font-semibold text-slate-950">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Live alerts</p>
                    <div className="mt-3 space-y-2">
                      {adminAlerts.map((alert) => (
                        <div key={`${alert.type}-${alert.time}`} className="rounded-2xl border border-slate-200 p-3">
                          <p className="text-[10px] font-bold tracking-wide text-amber-600">{alert.type}</p>
                          <p className="mt-1 text-slate-700">{alert.msg}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{alert.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Inventory snapshot</p>
                  <div className="mt-4 space-y-3">
                    {inventoryRows.map((row) => (
                      <div key={row.sku} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 text-sm text-slate-600">
                        <div>
                          <p className="font-semibold text-slate-950">{row.name}</p>
                          <p>{row.sku} • {row.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-950">{row.stock} units</p>
                          <p>{row.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Quick actions</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {adminQuickActions.map((action) => (
                      <span key={action} className="rounded-full bg-white px-4 py-2 text-sm text-slate-600">{action}</span>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-slate-600">
                    Product CRUD, bulk import, and role-based permissions are already linked to the admin API routes.
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </RouteShell>
      </div>
    </main>
  );
}