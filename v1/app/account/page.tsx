import { RouteShell } from "../_components/route-shell";
import { profileStats, profileSummary, savedAddresses } from "../../lib/customer";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <RouteShell
          eyebrow="Account"
          title="Customer profile"
          description="Profile starter for user details, addresses, loyalty points, and order history entry points."
        >
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Summary</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Name:</span> {profileSummary.name}</p>
                <p><span className="font-semibold text-slate-900">Email:</span> {profileSummary.email}</p>
                <p><span className="font-semibold text-slate-900">Phone:</span> {profileSummary.phone}</p>
                <p><span className="font-semibold text-slate-900">Default address:</span> {profileSummary.defaultAddress}</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {profileStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Saved addresses</p>
                <div className="mt-4 space-y-3">
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                      <p className="font-semibold text-slate-950">{address.label}{address.default ? " · Default" : ""}</p>
                      <p>{address.name}</p>
                      <p>{address.line1}</p>
                      <p>{address.city}, {address.region} {address.postalCode}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Profile editing, address CRUD, and saved preferences will be connected to backend APIs next.
              </div>
            </div>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}