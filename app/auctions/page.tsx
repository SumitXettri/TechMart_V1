"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabaseClient";

type Auction = {
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
  winning_bid_id?: string | null;
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

function statusStyles(status: Auction["status"]) {
  switch (status) {
    case "LIVE":
      return "bg-emerald-500/15 text-emerald-300";
    case "SCHEDULED":
      return "bg-sky-500/10 text-sky-300";
    case "ENDED":
      return "bg-slate-500/10 text-slate-300";
    case "CANCELLED":
      return "bg-rose-500/10 text-rose-300";
    default:
      return "bg-slate-500/10 text-slate-300";
  }
}

function AuctionPageContent() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(
    null,
  );
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [bidError, setBidError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user ?? null);

      const { data, error } = await supabase
        .from("auctions")
        .select(
          "*, product:products(id,name,slug,description,brand,base_price,currency)",
        )
        .order("starts_at", { ascending: true });

      if (error) {
        setError(error.message);
      } else if (data) {
        const list = data as Auction[];
        setAuctions(list);
        setSelectedAuctionId(list[0]?.id ?? null);
      }

      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    const auction =
      auctions.find((item) => item.id === selectedAuctionId) ||
      auctions[0] ||
      null;
    setSelectedAuction(auction);
    if (auction) {
      setBidAmount(
        (
          Number(auction.current_price) + Number(auction.bid_increment)
        ).toString(),
      );
      setMessage(null);
      setBidError(null);
    }
  }, [selectedAuctionId, auctions]);

  const handleSelectAuction = (auctionId: string) => {
    setSelectedAuctionId(auctionId);
    setMessage(null);
    setBidError(null);
  };

  const handleBidSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBidError(null);
    setMessage(null);

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!selectedAuction) {
      setBidError("Select an auction before placing a bid.");
      return;
    }

    const bidValue = Number(bidAmount);
    const minBid =
      Number(selectedAuction.current_price) +
      Number(selectedAuction.bid_increment);

    if (isNaN(bidValue) || bidValue < minBid) {
      setBidError(`Enter at least NPR ${minBid.toFixed(0)}.`);
      return;
    }

    setSubmitting(true);

    try {
      const { data: bidData, error: bidError } = await supabase
        .from("bids")
        .insert([
          {
            auction_id: selectedAuction.id,
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
        .eq("id", selectedAuction.id);

      if (updateError) {
        throw updateError;
      }

      setMessage("Bid placed successfully.");
      setAuctions((current) =>
        current.map((item) =>
          item.id === selectedAuction.id
            ? {
                ...item,
                current_price: bidValue.toString(),
                winning_bid_id: bidData.id,
              }
            : item,
        ),
      );
      setSelectedAuction({
        ...selectedAuction,
        current_price: bidValue.toString(),
        winning_bid_id: bidData.id,
      });
    } catch (err: any) {
      setBidError(err?.message ?? String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="store-page min-h-screen bg-[#f7f8f5] text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="mb-12 space-y-4">
          <p className="text-sm uppercase tracking-[0.32em] text-sky-300">
            Auctions
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Browse auctions & product details
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-300">
            Select an auction to view full product details, place a bid, and see
            current pricing.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-slate-300">
            Loading auctions…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-200">
            <p className="font-semibold">Unable to load auctions</p>
            <p className="mt-2 text-sm text-rose-100">{error}</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-slate-300">
            No auctions available yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20">
                <h2 className="text-xl font-semibold text-white">
                  Auction list
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Choose an auction to see complete details and place your bid.
                </p>
              </div>

              <div className="space-y-4">
                {auctions.map((auction) => (
                  <button
                    key={auction.id}
                    type="button"
                    onClick={() => handleSelectAuction(auction.id)}
                    className={`w-full rounded-4xl border p-6 text-left transition ${
                      selectedAuction?.id === auction.id
                        ? "border-sky-400 bg-sky-500/10"
                        : "border-white/10 bg-white/5 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
                          {auction.product.brand ?? "TechMart"}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-white">
                          {auction.product.name}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles(auction.status)}`}
                      >
                        {auction.status}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300 line-clamp-2">
                      {auction.product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                      <span>Current bid: NPR {auction.current_price}</span>
                      <span className="rounded-full bg-slate-900/80 px-3 py-1 text-slate-200">
                        {auction.product.currency ?? "NPR"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/20">
              {selectedAuction ? (
                <>
                  <div className="flex flex-col gap-3">
                    <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
                      {selectedAuction.product.brand ?? "TechMart"}
                    </p>
                    <h2 className="text-3xl font-semibold text-white">
                      {selectedAuction.product.name}
                    </h2>
                    <p className="text-sm leading-7 text-slate-300">
                      {selectedAuction.product.description}
                    </p>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                      <p className="text-sm text-slate-400">Current bid</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        NPR {selectedAuction.current_price}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                      <p className="text-sm text-slate-400">Bid increment</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        NPR {selectedAuction.bid_increment}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                      <p className="text-sm text-slate-400">Starts at</p>
                      <p className="mt-2 text-white">
                        {formatDate(selectedAuction.starts_at)}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                      <p className="text-sm text-slate-400">Ends at</p>
                      <p className="mt-2 text-white">
                        {formatDate(selectedAuction.ends_at)}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleBidSubmit} className="mt-8 space-y-4">
                    <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                      <p className="text-sm text-slate-400">Minimum bid</p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        NPR{" "}
                        {Number(selectedAuction.current_price) +
                          Number(selectedAuction.bid_increment)}
                      </p>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-200">
                        Your bid
                      </span>
                      <input
                        type="number"
                        min={
                          Number(selectedAuction.current_price) +
                          Number(selectedAuction.bid_increment)
                        }
                        step="1"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                      />
                    </label>

                    {bidError && (
                      <p className="text-sm text-rose-300">{bidError}</p>
                    )}
                    {message && (
                      <p className="text-sm text-emerald-300">{message}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
                    >
                      {submitting ? "Placing bid…" : "Place bid"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-12 text-center text-slate-300">
                  Select an auction to view details and place a bid.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AuctionPage() {
  return (
    <Suspense
      fallback={
        <div className="store-page min-h-screen bg-[#f7f8f5] p-10 text-center text-slate-600">
          Loading auctions...
        </div>
      }
    >
      <AuctionPageContent />
    </Suspense>
  );
}
