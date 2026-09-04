"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Provider = "manual" | "esewa" | "khalti";

export default function CheckoutPage() {
  const [orderId, setOrderId] = useState("TM-1001");
  const [amount, setAmount] = useState("2499");
  const [provider, setProvider] = useState<Provider>("esewa");
  const [customerName, setCustomerName] = useState("Customer");
  const [customerEmail, setCustomerEmail] = useState("customer@example.com");
  const [customerPhone, setCustomerPhone] = useState("9800000000");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: Number(amount),
          provider,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: { address, city, district, postalCode },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Failed to initialize payment.");
      }

      if (payload.providerUrl && payload.formData) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payload.providerUrl;
        form.style.display = "none";

        Object.entries(payload.formData).forEach(([key, value]) => {
          const field = document.createElement("input");
          field.type = "hidden";
          field.name = key;
          field.value = String(value);
          form.appendChild(field);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      setMessage("Checkout created successfully.");
      setDeliveryStatus("processing");
      window.location.href = payload.redirectUrl;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Payment initialization failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-page min-h-screen bg-[#f7f8f5] text-slate-950">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-sky-300">
              Secure checkout
            </p>
            <h1 className="mt-3 text-4xl font-bold text-white">
              Payment integration
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Back home
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={submitPayment}
            className="rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/20"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-1">
                <span className="mb-2 block text-sm text-slate-300">
                  Order ID
                </span>
                <input
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                  required
                />
              </label>

              <label className="block md:col-span-1">
                <span className="mb-2 block text-sm text-slate-300">
                  Amount (NPR)
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                  required
                />
              </label>

              <label className="block md:col-span-1">
                <span className="mb-2 block text-sm text-slate-300">
                  Payment provider
                </span>
                <select
                  value={provider}
                  onChange={(event) =>
                    setProvider(event.target.value as Provider)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                >
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="manual">Manual demo</option>
                </select>
              </label>

              <label className="block md:col-span-1">
                <span className="mb-2 block text-sm text-slate-300">
                  Customer name
                </span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                />
              </label>

              <label className="block md:col-span-1">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                />
              </label>

              <label className="block md:col-span-1">
                <span className="mb-2 block text-sm text-slate-300">Phone</span>
                <input
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                />
              </label>

              <div className="md:col-span-2">
                <p className="mb-3 text-sm font-semibold text-white">
                  Shipping details
                </p>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm text-slate-300">
                      Street address
                    </span>
                    <input
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      required
                      placeholder="House number, street, landmark"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">
                      City
                    </span>
                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">
                      District
                    </span>
                    <input
                      value={district}
                      onChange={(event) => setDistrict(event.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">
                      Postal code
                    </span>
                    <input
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400"
                    />
                  </label>
                </div>
              </div>
            </div>

            {message && (
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            >
              {loading ? "Processing payment..." : "Pay now"}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="rounded-4xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Delivery status
              </p>
              <div className="mt-6 space-y-4">
                {["pending", "processing", "shipped", "delivered"].map(
                  (status, index) => {
                    const active =
                      ["pending", "processing", "shipped", "delivered"].indexOf(
                        deliveryStatus,
                      ) >= index;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span
                          className={`h-3 w-3 rounded-full ${active ? "bg-emerald-400" : "bg-slate-600"}`}
                        />
                        <span
                          className={active ? "text-white" : "text-slate-500"}
                        >
                          {status[0].toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">
                Your order moves from payment confirmation to processing,
                shipment, and final delivery.
              </p>
            </div>
            <div className="rounded-4xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Included providers
              </p>
              <ul className="mt-5 space-y-4 text-sm text-slate-200">
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="font-semibold text-white">eSewa</span>
                  <p className="mt-1 text-slate-300">
                    Nepal-payment integration ready with redirect form flow.
                  </p>
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="font-semibold text-white">Khalti</span>
                  <p className="mt-1 text-slate-300">
                    Browser-ready checkout payload with callback URL handling.
                  </p>
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="font-semibold text-white">Manual demo</span>
                  <p className="mt-1 text-slate-300">
                    Safe local verification mode for development and testing.
                  </p>
                </li>
              </ul>
            </div>

            <div className="rounded-4xl border border-sky-500/20 bg-sky-500/10 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-200">
                Setup next
              </p>
              <p className="mt-3 text-sm leading-6 text-sky-50">
                Add your real gateway credentials to .env and replace the demo
                route logic with live API requests from eSewa or Khalti.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
