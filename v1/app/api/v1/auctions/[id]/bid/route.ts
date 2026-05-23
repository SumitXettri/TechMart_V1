import { NextResponse } from "next/server";
import { placeLiveBid } from "../../../../../../lib/auctions";
import { Prisma } from "@prisma/client";
import prisma from "../../../../../../lib/db";
import { enqueueBid } from "../../../../../../lib/bidQueue";

type AuctionBidRouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: AuctionBidRouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const amount = Number(body.amount);
  const version = Number(body.version);

  if (Number.isNaN(amount) || Number.isNaN(version)) {
    return NextResponse.json({ success: false, message: "Invalid bid payload" }, { status: 400 });
  }

  // Prefer DB-backed atomic update when Prisma is available
  try {
    const auctionId = Number(id);

    // Attempt an atomic conditional update: only update when version matches and currentHighestBid is less than proposed
    const updateResult = await prisma.auction.updateMany({
      where: {
        id: auctionId,
        version: version,
        currentHighestBid: { lt: new Prisma.Decimal(amount) },
      },
      data: {
        currentHighestBid: new Prisma.Decimal(amount),
        version: { increment: 1 },
        totalBids: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      // Determine reason: not found, version mismatch, or bid too low
      const current = await prisma.auction.findUnique({ where: { id: auctionId } });
      if (!current) return NextResponse.json({ success: false, message: "Auction not found" }, { status: 404 });
      if (current.version !== version) return NextResponse.json({ success: false, message: "Auction updated by another bidder" }, { status: 409 });
      if (new Prisma.Decimal(amount).lte(current.currentHighestBid)) return NextResponse.json({ success: false, message: "Bid must exceed current highest bid" }, { status: 400 });
      return NextResponse.json({ success: false, message: "Bid failed to apply" }, { status: 409 });
    }

    // Fetch updated auction to return version
    const updated = await prisma.auction.findUnique({ where: { id: auctionId } });

    return NextResponse.json({
      success: true,
      data: {
        auctionId: id,
        status: "accepted",
        submittedBid: amount,
        version: updated?.version ?? version + 1,
        message: "Bid accepted and version advanced.",
      },
    });
  } catch {
    // If Prisma isn't available or any DB error occurs, fallback to in-memory implementation
    const result = placeLiveBid(id, amount, version);

    if (!result.ok) {
      return NextResponse.json({ success: false, message: result.message }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      data: {
        auctionId: id,
        status: "accepted",
        submittedBid: amount,
        version: result.auction.version,
        message: "Bid accepted and version advanced (in-memory fallback).",
      },
    });
  } finally {
    // enqueue background processing (notifications, audit, etc.) — best-effort
    try { void enqueueBid({ auctionId: id, amount, userId: undefined }); } catch {}
  }
}