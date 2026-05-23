import { NextResponse } from "next/server";
import { auctionItems as fallbackItems, auctionRoomSummary as fallbackSummary } from "../../../../lib/auctions";
import prisma from "../../../../lib/db";

export async function GET() {
  try {
    const rows = await prisma.auction.findMany({ include: { productVariant: { include: { product: true } } }, take: 50 });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: true, data: { rooms: fallbackItems, summary: fallbackSummary } });
    }

    const rooms = rows.map((r) => ({
      id: String(r.id),
      title: r.productVariant?.product?.name ?? r.productVariant?.sku ?? "",
      product: r.productVariant?.product?.category ?? "",
      currentBid: `Rs. ${r.currentHighestBid.toNumber().toLocaleString()}`,
      bids: r.totalBids,
      endsIn: r.endTime ? new Date(r.endTime).toISOString() : "",
      status: r.status as "Live" | "Ending Soon" | "Upcoming",
    }));

    const summary = { liveRooms: rooms.length, endingSoon: Math.max(0, Math.floor(rooms.length / 3)), upcoming: 0, totalWatchers: 0 };

    return NextResponse.json({ success: true, data: { rooms, summary } });
  } catch {
    return NextResponse.json({ success: true, data: { rooms: fallbackItems, summary: fallbackSummary } });
  }
}