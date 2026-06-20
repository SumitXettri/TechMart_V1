import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white"
          >
            TechMart
          </Link>

          <nav className="flex items-center gap-3 text-sm text-slate-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/register" className="hover:text-white">
              Register
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-2 text-slate-950 font-semibold"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-sm text-sky-300">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Live auctions, fast shipping.
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                Shop smarter on Nepal’s premier marketplace.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Browse curated deals, participate in auctions, and manage orders
                with a trusted local shopping experience.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-8 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-sky-500/30 to-transparent" />
            <div className="relative space-y-6">
              <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.32em] text-sky-300">
                  Featured Auction
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-white">
                  Smartphone X13
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Live bidding happens now — reserve your best price before the
                  clock ends.
                </p>
                <div className="mt-6 flex items-center justify-between rounded-3xl bg-slate-900/80 p-4">
                  <div>
                    <p className="text-xs uppercase text-slate-500">
                      Current bid
                    </p>
                    <p className="text-xl font-semibold text-white">
                      NPR 21,499
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950">
                    Bid now
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                  <p className="text-sm text-slate-400">New arrivals</p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    Latest gadgets
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                  <p className="text-sm text-slate-400">Best deal</p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    Secure payments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
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
              className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-lg shadow-slate-950/10"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-sky-300">
                {item.label}
              </p>
              <h3 className="mt-4 text-xl font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-900/90 py-6 text-center text-sm text-slate-400">
        <div className="mx-auto max-w-7xl px-6">
          © {new Date().getFullYear()} TechMart. Nepal’s local marketplace.
        </div>
      </footer>
    </div>
  );
}
