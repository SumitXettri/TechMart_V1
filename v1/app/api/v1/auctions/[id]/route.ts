import { NextResponse } from "next/server";
import { getLiveAuction as fallbackGet } from "../../../../../lib/auctions";
import prisma from "../../../../../lib/db";

type AuctionRouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: AuctionRouteParams) {
  const { id } = await params;
  try {
    const aid = Number(id);
    const row = await prisma.auction.findUnique({ where: { id: aid }, include: { productVariant: { include: { product: true } } } });
    if (!row) {
      const fallback = fallbackGet(id);
      if (!fallback) return NextResponse.json({ success: false, message: "Auction not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: fallback });
    }

    const data = {
      id: String(row.id),
      title: row.productVariant?.product?.name ?? row.productVariant?.sku ?? "",
      currentBid: `Rs. ${row.currentHighestBid.toNumber().toLocaleString()}`,
      nextMinBid: `Rs. ${(row.currentHighestBid.toNumber() + Number(row.minBidIncrement)).toLocaleString()}`,
      totalBids: row.totalBids,
      watchers: 0,
      reserve: "",
      buyNow: "",
      countdown: row.endTime ? new Date(row.endTime).toISOString() : "",
      version: row.version,
      bidHistory: [],
    };

    return NextResponse.json({ success: true, data });
  } catch {
    const fallback = fallbackGet(id);
    if (!fallback) return NextResponse.json({ success: false, message: "Auction not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: fallback });
  }
}