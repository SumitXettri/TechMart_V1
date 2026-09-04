"use client";

import { useEffect, useState } from "react";

type Delivery = {
  id: string;
  order_number: string;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  last_location: string | null;
};

const statuses = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "EXCEPTION",
];

function labelize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    orderId: "",
    carrier: "",
    trackingNumber: "",
    estimatedDelivery: "",
  });

  async function loadDeliveries() {
    setLoading(true);
    const response = await fetch("/api/admin/deliveries");
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Unable to load deliveries.");
    else setDeliveries(data.deliveries ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/deliveries")
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (!active) return;
        if (!response.ok) setError(data.error ?? "Unable to load deliveries.");
        else setDeliveries(data.deliveries ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load deliveries.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function createShipment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const response = await fetch("/api/admin/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Unable to create shipment.");
    else {
      setMessage("Shipment created and ready for processing.");
      setForm({
        orderId: "",
        carrier: "",
        trackingNumber: "",
        estimatedDelivery: "",
      });
      await loadDeliveries();
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    setError(null);
    const response = await fetch("/api/admin/deliveries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Unable to update shipment.");
    else
      setDeliveries((current) =>
        current.map((delivery) =>
          delivery.id === id ? { ...delivery, ...data.shipment } : delivery,
        ),
      );
  }

  return (
    <section className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
          Fulfillment control
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Delivery management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Create shipments, assign tracking details, and keep customers informed
          as orders move to their door.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : null}

      <form
        onSubmit={createShipment}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-5">
          <h2 className="font-bold text-slate-950">Create shipment</h2>
          <p className="mt-1 text-xs text-slate-500">
            Connect an order to its delivery record.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {(
            [
              "orderId",
              "carrier",
              "trackingNumber",
              "estimatedDelivery",
            ] as const
          ).map((field) => (
            <label key={field} className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {field === "orderId"
                  ? "Order ID"
                  : field === "trackingNumber"
                    ? "Tracking number"
                    : field === "estimatedDelivery"
                      ? "Estimated delivery"
                      : "Carrier"}
              </span>
              <input
                required={field === "orderId"}
                type={field === "estimatedDelivery" ? "date" : "text"}
                value={form[field]}
                onChange={(event) =>
                  setForm({ ...form, [field]: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </label>
          ))}
        </div>
        <button
          disabled={saving}
          className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create shipment"}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5">
          <h2 className="font-bold text-slate-950">Active shipment records</h2>
          <p className="mt-1 text-xs text-slate-500">
            Update status as fulfillment progresses.
          </p>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading shipments...</p>
        ) : deliveries.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No shipments have been created yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_1fr_220px] lg:items-center"
              >
                <div>
                  <p className="font-bold text-slate-950">
                    {delivery.order_number || "Order record"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {delivery.carrier ?? "Carrier pending"} ·{" "}
                    {delivery.tracking_number ?? "Tracking pending"}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {delivery.last_location ?? "Location not updated"}
                  {delivery.estimated_delivery
                    ? ` · ETA ${delivery.estimated_delivery}`
                    : ""}
                </p>
                <select
                  value={delivery.status}
                  onChange={(event) =>
                    updateStatus(delivery.id, event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-teal-600"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {labelize(status)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
