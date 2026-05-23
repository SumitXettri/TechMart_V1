import { RouteShell } from "../_components/route-shell";
import { cartItems, cartSummary, reservationNote } from "../../lib/cart";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <RouteShell
          eyebrow="Checkout"
          title="Cart"
          description="Cart starter for persistent items, promo code entry, and saved-for-later actions."
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={`${item.name}-${item.variant}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.variant}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-950">{item.price}</p>
                      <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Summary</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{cartSummary.subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{cartSummary.shipping}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{cartSummary.tax}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Promo code</span>
                  <span>{cartSummary.discount}</span>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-slate-200">{reservationNote}</div>
            </aside>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}