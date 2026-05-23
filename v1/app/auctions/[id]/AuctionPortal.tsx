"use client";

import type { FormEvent } from "react";
import { useEffect, useState, startTransition } from "react";
import { connectAuctionSocket } from "@/lib/socketClient";

type AuctionPortalProps = {
  id: string;
  title: string;
  sku: string;
  basePrice: number;
  currentHighestBid: number;
  minBidIncrement: number;
  totalBids: number;
  endTime: string;
  winnerAnonymized: string;
  version: number;
};

export default function AuctionPortal({
  id,
  title,
  sku,
  basePrice,
  currentHighestBid,
  minBidIncrement,
  totalBids,
  endTime,
  winnerAnonymized,
  version,
}: AuctionPortalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [auctionVersion, setAuctionVersion] = useState(version);
  const [auctionBid, setAuctionBid] = useState(currentHighestBid);
  const [bidCount, setBidCount] = useState(totalBids);
  const [winner, setWinner] = useState(winnerAnonymized);
  const [timeLeft, setTimeLeft] = useState("");
  const [bidInput, setBidInput] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      const difference = new Date(endTime).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft("AUCTION CONCLUDED");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    let mounted = true;
    let sConn: Awaited<ReturnType<typeof connectAuctionSocket>> | null = null;

    connectAuctionSocket()
      .then((socket) => {
        if (!mounted || !socket) return;
        sConn = socket;
        try { socket.joinRoom(id); } catch {}

        const onNew = (data: unknown) => {
          try {
            if (!data || typeof data !== 'object') return;
            const obj = data as Record<string, unknown>;
            if (obj.auctionId !== id) return;
            const amount = typeof obj.amount === 'number' ? obj.amount : undefined;
            const totalBidsNum = typeof obj.totalBids === 'number' ? obj.totalBids : undefined;
            const winnerStr = typeof obj.winner === 'string' ? obj.winner : undefined;
            if (amount !== undefined) setAuctionBid(amount);
            if (totalBidsNum !== undefined) setBidCount(totalBidsNum);
            if (winnerStr) setWinner(winnerStr);
          } catch {}
        };

        try { socket.onNewBid(onNew); } catch {}
      })
      .catch(() => {});

    return () => {
      mounted = false;
      try { sConn?.disconnect(); } catch {}
    };
  }, [id, isLoading]);

  const minimumRequired = auctionBid + minBidIncrement;

  const handlePlaceBid = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBidError("");
    setBidSuccess("");

    const proposedAmount = Number(bidInput);
    if (Number.isNaN(proposedAmount)) {
      setBidError("Please input a valid numeric financial figure.");
      return;
    }

    if (proposedAmount < minimumRequired) {
      setBidError(`Bid insufficient. System parameters demand at least Rs. ${minimumRequired.toLocaleString()}`);
      return;
    }

    // optimistic update: apply immediately, rollback if server rejects
    const prevBid = auctionBid;
    const prevCount = bidCount;
    setAuctionBid(proposedAmount);
    setBidCount((c) => c + 1);
    setWinner("You");
    setBidInput("");
    setIsSubmitting(true);

    startTransition(() => {
      fetch(`/api/v1/auctions/${id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: proposedAmount, version: auctionVersion }),
      })
        .then(async (response) => {
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload?.message ?? "Bid rejected");
          }

          setAuctionVersion((current) => current + 1);
          setBidSuccess(`Bid successfully locked at Rs. ${proposedAmount.toLocaleString()}!`);
        })
        .catch((error: Error) => {
          // rollback optimistic
          setAuctionBid(prevBid);
          setBidCount(prevCount);
          setBidError(error.message || 'Bid failed');
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 text-slate-100">
        <div className="w-full max-w-4xl bg-slate-800 rounded-2xl border border-slate-700 p-8 space-y-8 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-2/3">
              <div className="h-4 bg-slate-700 rounded w-1/4" />
              <div className="h-8 bg-slate-700 rounded w-full" />
            </div>
            <div className="h-10 bg-slate-700 rounded w-24" />
          </div>
          <hr className="border-slate-700" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-700 aspect-square rounded-xl w-full" />
            <div className="space-y-6 py-2">
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded w-1/3" />
                <div className="h-10 bg-slate-700 rounded w-1/2" />
              </div>
              <div className="h-12 bg-slate-700 rounded w-full" />
              <div className="h-24 bg-slate-700 rounded w-full" />
            </div>
          </div>
        </div>
        <p className="text-slate-400 mt-4 text-sm tracking-wide">Connecting to TechMart Real-Time Auction Mesh Network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="bg-red-500 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse mr-2">
              Live Auction
            </span>
            <span className="text-sm font-mono text-cyan-100">SKU: {sku}</span>
            <span className="ml-3 text-xs text-cyan-100/80">{isConnected ? "Connected" : "Connecting"}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/40 px-4 py-1.5 rounded-lg border border-white/10">
            <span className="text-xs text-cyan-200 uppercase font-bold tracking-wider">Time Remaining:</span>
            <span className="text-lg font-mono text-white font-bold tracking-md">{timeLeft}</span>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-between bg-slate-850 p-4 rounded-xl border border-slate-700">
            <div className="aspect-video bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600 overflow-hidden relative group">
              <span className="text-slate-400 text-sm group-hover:scale-105 transition-transform duration-300">[ High-Res Product Render Area ]</span>
              <div className="absolute bottom-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-slate-300">360° View Enabled</div>
            </div>
            <div className="mt-4 space-y-2">
              <h1 className="text-xl font-bold text-white leading-tight">{title}</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hardware validation checks verified. Factory sealed box. Extended 24-month manufacturer warranty is included automatically at checkout.
              </p>
              <p className="text-xs text-cyan-200">Base price: Rs. {basePrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">Current Highest Bid</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">Rs. {auctionBid.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">Total Bids Processed</span>
                <span className="text-2xl font-black text-white font-mono">{bidCount} <span className="text-xs text-slate-500 font-normal">bids</span></span>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-700/80 rounded-lg px-4 py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Top Bidder Node:</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{winner}</span>
            </div>

            <form onSubmit={handlePlaceBid} className={`space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-700 ${bidError ? "animate-shake" : ""}`}>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Place Cryptographic Order Bid (NPR)</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-mono text-sm">Rs.</span>
                </div>
                <input
                  type="number"
                  value={bidInput}
                  onChange={(event) => setBidInput(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-24 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder={minimumRequired.toString()}
                />
                <div className="absolute inset-y-1.5 right-1.5">
                  <button
                    type="button"
                    onClick={() => setBidInput(minimumRequired.toString())}
                    className="h-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-2.5 rounded border border-slate-600 transition-colors"
                  >
                    Min Auto-Fill
                  </button>
                </div>
              </div>

              {bidError ? <p className="text-red-400 text-xs font-medium animate-shake">⚠️ {bidError}</p> : null}
              {bidSuccess ? <p className="text-emerald-400 text-xs font-medium">✅ {bidSuccess}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-cyan-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? "Verifying Transaction Block..." : "Transmit Sealed Bid"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}