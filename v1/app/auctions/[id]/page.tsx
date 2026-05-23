import { notFound } from "next/navigation";
import { getLiveAuction } from "../../../lib/auctions";
import AuctionPortal from "./AuctionPortal";

type AuctionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const { id } = await params;
  const auction = getLiveAuction(id);

  if (!auction) {
    notFound();
  }

  return (
    <AuctionPortal
      id={auction.id}
      title={auction.title}
      sku={`TM-${auction.id.slice(0, 8).toUpperCase()}`}
      basePrice={auction.basePrice}
      currentHighestBid={auction.currentHighestBidValue}
      minBidIncrement={auction.minBidIncrement}
      totalBids={auction.totalBids}
      endTime={auction.endTime}
      winnerAnonymized={auction.winnerAnonymized ?? "Anonymous"}
      version={auction.version}
    />
  );
}