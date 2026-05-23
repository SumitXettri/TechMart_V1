import { notFound } from "next/navigation";
import { RouteShell } from "../../_components/route-shell";
import { recentOrders } from "../../../lib/customer";
import { orderTimeline, orderTotals } from "../../../lib/orders";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = recentOrders.find((item) => item.id.toLowerCase() === id);

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <RouteShell
          eyebrow="Orders"
          title={order.id}
          description="Order detail starter for shipment status, payment summary, invoice download, and return flow."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Item</p>
                <p className="mt-1 font-semibold text-slate-950">{order.item}</p>
                <p className="mt-4 text-sm text-slate-500">Status</p>
                <p className="mt-1 font-semibold text-slate-950">{order.status}</p>
                <p className="mt-4 text-sm text-slate-500">Date</p>
                <p className="mt-1 font-semibold text-slate-950">{order.date}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Fulfillment timeline</p>
                <div className="mt-4 space-y-3">
                  {orderTimeline.map((step) => (
                    <div key={step.label} className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                      <p className="font-semibold text-slate-950">{step.label}</p>
                      <p className="mt-1">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Payment totals</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between"><span>Subtotal</span><span>{orderTotals.subtotal}</span></div>
                  <div className="flex items-center justify-between"><span>Shipping</span><span>{orderTotals.shipping}</span></div>
                  <div className="flex items-center justify-between"><span>Tax</span><span>{orderTotals.tax}</span></div>
                  <div className="flex items-center justify-between font-semibold text-slate-950"><span>Total</span><span>{orderTotals.total}</span></div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Invoice download, tracking link, returns, and support ticket creation will connect here next.
              </div>
            </div>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}