import Link from "next/link";
import { RouteShell } from "../_components/route-shell";
import { recentOrders } from "../../lib/customer";
import { orderActions } from "../../lib/orders";

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <RouteShell
          eyebrow="Orders"
          title="Order history"
          description="Order history starter for status tracking, invoice access, and return initiation."
        >
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id.toLowerCase()}`} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-white">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">{order.id}</p>
                  <h2 className="mt-2 text-lg font-bold text-slate-950">{order.item}</h2>
                  <p className="text-sm text-slate-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-950">{order.total}</p>
                  <p className="text-sm text-slate-600">{order.status}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Quick actions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {orderActions.map((action) => (
                <span key={action} className="rounded-full bg-white px-4 py-2 text-sm text-slate-600">{action}</span>
              ))}
            </div>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}