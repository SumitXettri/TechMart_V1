"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { supabase } from "../../../lib/supabaseClient";

type AuctionDetail = {
  id: string;
  start_price: string;
  reserve_price: string | null;
  buy_it_now_price: string | null;
  current_price: string;
  bid_increment: string;
  starts_at: string;
  ends_at: string;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    brand: string | null;
    base_price: string;
    currency: string;
  };
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auctionId = params?.id as string;
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!auctionId) return;

    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user ?? null);

      const { data, error } = await supabase
        .from("auctions")
        .select(
          "*, product:products(id,name,slug,description,brand,base_price,currency)",
        )
        .eq("id", auctionId)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        const loadedAuction = data as AuctionDetail;
        setAuction(loadedAuction);
        const nextBid =
          Number(loadedAuction.current_price) +
          Number(loadedAuction.bid_increment);
        setBidAmount(nextBid.toString());
      }
      setLoading(false);
    };

    load();
  }, [auctionId]);

  const handleBidSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!user) {
      router.push("/login");
      return;
    }

    if (!auction) {
      setError("Auction not loaded yet.");
      return;
    }

    const bidValue = Number(bidAmount);
    const minBid =
      Number(auction.current_price) + Number(auction.bid_increment);

    if (isNaN(bidValue) || bidValue < minBid) {
      setError(`Enter at least NPR ${minBid.toFixed(2)}.`);
      return;
    }

    setLoading(true);

    try {
      const { data: bidData, error: bidError } = await supabase
        .from("bids")
        .insert([
          {
            auction_id: auction.id,
            user_id: user.id,
            amount: bidValue,
            is_auto_bid: false,
          },
        ])
        .select("id")
        .single();

      if (bidError) {
        throw bidError;
      }

      const { error: updateError } = await supabase
        .from("auctions")
        .update({ current_price: bidValue, winning_bid_id: bidData.id })
        .eq("id", auction.id);

      if (updateError) {
        throw updateError;
      }

      setMessage("Bid placed successfully.");
      setAuction({ ...auction, current_price: bidValue.toString() });
    } catch (bidError: any) {
      setError(bidError?.message ?? String(bidError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <button
          onClick={() => router.back()}
          className="mb-8 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          Back to auctions
        </button>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-slate-300">
            Loading auction…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-200">
            <p className="font-semibold">Unable to load auction</p>
            <p className="mt-2 text-sm text-rose-100">{error}</p>
          </div>
        ) : auction ? (
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.32em] text-sky-300">
                {auction.product.brand ?? "TechMart"}
              </p>
              <h1 className="mt-4 text-4xl font-bold text-white">
                {auction.product.name}
              </h1>
              <p className="mt-6 text-sm leading-7 text-slate-300">
                {auction.product.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                  <p className="text-sm text-slate-400">Current bid</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    NPR {auction.current_price}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                  <p className="text-sm text-slate-400">Bid increment</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    NPR {auction.bid_increment}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                  <p className="text-sm text-slate-400">Starts at</p>
                  <p className="mt-2 text-white">
                    {formatDate(auction.starts_at)}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                  <p className="text-sm text-slate-400">Ends at</p>
                  <p className="mt-2 text-white">
                    {formatDate(auction.ends_at)}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-950/80 p-6 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                  Auction status
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {auction.status}
                </p>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-4xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
                <h2 className="text-xl font-semibold text-white">
                  Place a bid
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Minimum bid: NPR{" "}
                  {Number(auction.current_price) +
                    Number(auction.bid_increment)}
                </p>

                {message && (
                  <div className="mt-4 rounded-3xl bg-emerald-500/15 p-3 text-emerald-200">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="mt-4 rounded-3xl bg-rose-500/10 p-3 text-rose-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleBidSubmit} className="mt-6 space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-200">
                      Your bid
                    </span>
                    <input
                      type="number"
                      min={
                        Number(auction.current_price) +
                        Number(auction.bid_increment)
                      }
                      step="1"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
                  >
                    {loading ? "Placing bid…" : "Place bid"}
                  </button>
                </form>
              </div>

              <div className="rounded-4xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
                <h2 className="text-xl font-semibold text-white">
                  Product link
                </h2>
                <button
                  onClick={() =>
                    router.push(`/products/${auction.product.slug}`)
                  }
                  className="mt-4 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  View product
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-slate-300">
            Auction not found.
          </div>
        )}
      </main>
    </div>
  );
}
