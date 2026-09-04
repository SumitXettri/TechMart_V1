import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-950">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-[#123d3a] text-white">
          <div className="absolute -right-20 -top-28 h-96 w-96 rounded-full border-[48px] border-amber-300/15" />
          <div className="absolute bottom-0 right-1/4 h-28 w-28 rounded-full bg-teal-300/10 blur-2xl" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:py-28">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                Nepal&apos;s marketplace for better tech
              </div>
              <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-tight sm:text-7xl">
                Find your next favorite device.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-teal-50/75">
                Shop trusted products, compete in live auctions, and get every
                order delivered with clear tracking from checkout to your door.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
                >
                  Explore products{" "}
                  <span className="ml-2" aria-hidden="true">
                    -&gt;
                  </span>
                </Link>
                <Link
                  href="/auctions"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Browse live auctions
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-5 rounded-[2rem] bg-amber-300/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#f3f1e9] p-5 text-slate-950 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
                  <span>Featured drop</span>
                  <span>01 / 03</span>
                </div>
                <div className="mt-5 flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-orange-100 to-teal-100">
                  <div className="text-center">
                    <div className="text-8xl drop-shadow-xl" aria-hidden="true">
                      ▣
                    </div>
                    <p className="mt-4 text-sm font-bold text-teal-900">
                      Smart tech, ready to move
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Live auction</p>
                    <h2 className="mt-1 text-2xl font-black">Smartphone X13</h2>
                  </div>
                  <Link
                    href="/auctions"
                    className="rounded-lg bg-teal-800 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
                  >
                    Bid now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
                Why TechMart
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Everything after the click matters.
              </h2>
            </div>
            <Link
              href="/checkout"
              className="text-sm font-bold text-teal-700 hover:text-teal-900"
            >
              See secure checkout -&gt;
            </Link>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Local support",
                title: "Store pickup & service",
                description:
                  "Visit our local stores for repair bookings and support.",
              },
              {
                label: "Auctions",
                title: "Win top products",
                description:
                  "Join auctions, place bids, and take home exclusive deals.",
              },
              {
                label: "Payments",
                title: "Pay with local wallets",
                description: "Use eSewa, Khalti, or direct checkout securely.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">
                  {item.label}
                </p>
                <h3 className="mt-4 text-xl font-black text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <div className="mx-auto max-w-7xl px-6">
          © {new Date().getFullYear()} TechMart. Nepal’s local marketplace.
        </div>
      </footer>
    </div>
  );
}
