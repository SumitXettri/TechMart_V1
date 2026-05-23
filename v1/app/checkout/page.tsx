import { RouteShell } from "../_components/route-shell";
import { checkoutSteps, paymentMethods, shippingOptions } from "../../lib/cart";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <RouteShell
          eyebrow="Checkout"
          title="Checkout"
          description="Checkout starter with the five steps from shipping to confirmation."
        >
          <div className="grid gap-4 md:grid-cols-5">
            {checkoutSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Step {index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Shipping and delivery details</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-white px-4 py-3">Saved address selection and validation</div>
                {shippingOptions.map((option) => (
                  <div key={option.name} className="rounded-2xl bg-white px-4 py-3">
                    <p className="font-semibold text-slate-950">{option.name}</p>
                    <p>{option.estimate} · {option.price}</p>
                  </div>
                ))}
                <div className="rounded-2xl bg-white px-4 py-3">Cart reservation countdown and order review</div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Payment</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                {paymentMethods.map((method) => (
                  <div key={method}>{method}</div>
                ))}
              </div>
            </div>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}