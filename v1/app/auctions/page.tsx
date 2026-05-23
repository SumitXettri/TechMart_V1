import { RouteShell } from "../_components/route-shell";
import Link from "next/link";
import { auctionItems, auctionRoomSummary, auctionRules } from "../../lib/auctions";

export default function AuctionsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <RouteShell
          eyebrow="Auctions"
          title="Live auctions"
          description="Auction starter for live listings, countdown timers, watchlist actions, and detail navigation."
        >
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Live rooms</p>
              <p className="mt-2 text-3xl font-black">{auctionRoomSummary.liveRooms}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Ending soon</p>
              <p className="mt-2 text-3xl font-black">{auctionRoomSummary.endingSoon}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Upcoming</p>
              <p className="mt-2 text-3xl font-black">{auctionRoomSummary.upcoming}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Watchers</p>
              <p className="mt-2 text-3xl font-black">{auctionRoomSummary.totalWatchers}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {auctionItems.map((item) => (
              <Link key={item.id} href={`/auctions/${item.id}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{item.status}</p>
                <h2 className="mt-3 text-lg font-bold text-slate-950">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{item.product}</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Current bid: <span className="font-semibold text-slate-900">{item.currentBid}</span></p>
                  <p>Bids: <span className="font-semibold text-slate-900">{item.bids}</span></p>
                  <p>Ends in: <span className="font-semibold text-slate-900">{item.endsIn}</span></p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Auction rules</p>
            <ul className="mt-3 space-y-2">
              {auctionRules.map((rule) => (
                <li key={rule} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}