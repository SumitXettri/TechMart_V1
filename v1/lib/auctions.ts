export type AuctionSummary = {
  id: string;
  title: string;
  product: string;
  currentBid: string;
  bids: number;
  endsIn: string;
  status: "Live" | "Ending Soon" | "Upcoming";
};

export type AuctionDetail = {
  id: string;
  title: string;
  currentBid: string;
  nextMinBid: string;
  totalBids: number;
  watchers: number;
  reserve: string;
  buyNow: string;
  countdown: string;
  bidHistory: Array<[string, string, string]>;
};

export const auctionItems: AuctionSummary[] = [
  {
    id: "sony-a7iv-body",
    title: "Sony A7 IV Body",
    product: "Cameras & Photography",
    currentBid: "Rs. 245,000",
    bids: 18,
    endsIn: "01:12:18",
    status: "Ending Soon",
  },
  {
    id: "m1-pro-macbook-16",
    title: "MacBook Pro 16-inch M1 Pro",
    product: "Laptops & Computers",
    currentBid: "Rs. 318,000",
    bids: 24,
    endsIn: "08:44:03",
    status: "Live",
  },
  {
    id: "ps5-disc-edition",
    title: "PlayStation 5 Disc Edition",
    product: "Gaming",
    currentBid: "Rs. 92,500",
    bids: 12,
    endsIn: "Starts soon",
    status: "Upcoming",
  },
];

export const auctionDetails = {
  "sony-a7iv-body": {
    id: "sony-a7iv-body",
    title: "Sony A7 IV Body",
    currentBid: "Rs. 245,000",
    nextMinBid: "Rs. 247,500",
    totalBids: 18,
    watchers: 42,
    reserve: "Not met",
    buyNow: "Rs. 272,000",
    countdown: "01:12:18",
    version: 3,
    bidHistory: [
      ["User****18a", "Rs. 245,000", "12:41 PM"],
      ["User****29b", "Rs. 240,000", "12:39 PM"],
      ["User****77c", "Rs. 237,500", "12:36 PM"],
    ],
  },
  "m1-pro-macbook-16": {
    id: "m1-pro-macbook-16",
    title: "MacBook Pro 16-inch M1 Pro",
    currentBid: "Rs. 318,000",
    nextMinBid: "Rs. 320,000",
    totalBids: 24,
    watchers: 58,
    reserve: "Met",
    buyNow: "Rs. 349,000",
    countdown: "08:44:03",
    version: 8,
    bidHistory: [
      ["User****14a", "Rs. 318,000", "12:44 PM"],
      ["User****02b", "Rs. 314,000", "12:42 PM"],
      ["User****61c", "Rs. 310,000", "12:40 PM"],
    ],
  },
  "ps5-disc-edition": {
    id: "ps5-disc-edition",
    title: "PlayStation 5 Disc Edition",
    currentBid: "Rs. 92,500",
    nextMinBid: "Rs. 95,000",
    totalBids: 12,
    watchers: 33,
    reserve: "Upcoming",
    buyNow: "Rs. 104,000",
    countdown: "Starts soon",
    version: 1,
    bidHistory: [
      ["User****80a", "Rs. 92,500", "Scheduled"],
      ["User****43b", "Rs. 90,000", "Scheduled"],
      ["User****11c", "Rs. 87,500", "Scheduled"],
    ],
  },
} as const;

type LiveAuctionState = (typeof auctionDetails)[keyof typeof auctionDetails] & {
  basePrice: number;
  endTime: string;
  minBidIncrement: number;
  currentHighestBidValue: number;
};

const initialAuctionRuntimeEntries: Array<[string, LiveAuctionState]> = [
  ["sony-a7iv-body", {
    ...auctionDetails["sony-a7iv-body"],
    basePrice: 230000,
    endTime: new Date(Date.now() + 1000 * 60 * 75).toISOString(),
    minBidIncrement: 2500,
    currentHighestBidValue: 245000,
  }],
  ["m1-pro-macbook-16", {
    ...auctionDetails["m1-pro-macbook-16"],
    basePrice: 285000,
    endTime: new Date(Date.now() + 1000 * 60 * 525).toISOString(),
    minBidIncrement: 2000,
    currentHighestBidValue: 318000,
  }],
  ["ps5-disc-edition", {
    ...auctionDetails["ps5-disc-edition"],
    basePrice: 85000,
    endTime: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    minBidIncrement: 2500,
    currentHighestBidValue: 92500,
  }],
];

function cloneLiveAuctionState(state: LiveAuctionState): LiveAuctionState {
  return {
    ...state,
    bidHistory: state.bidHistory.map((entry) => [...entry] as [string, string, string]),
  };
}

const auctionRuntime = new Map<string, LiveAuctionState>(
  initialAuctionRuntimeEntries.map(([id, state]) => [id, cloneLiveAuctionState(state)]),
);

export function resetLiveAuctions() {
  auctionRuntime.clear();
  initialAuctionRuntimeEntries.forEach(([id, state]) => {
    auctionRuntime.set(id, cloneLiveAuctionState(state));
  });
}

export function getLiveAuction(id: string) {
  return auctionRuntime.get(id) ?? null;
}

export function listLiveAuctions() {
  return [...auctionRuntime.values()];
}

export function placeLiveBid(id: string, proposedBid: number, currentVersion: number) {
  const liveAuction = auctionRuntime.get(id);

  if (!liveAuction) {
    return { ok: false as const, status: 404, message: "Auction not found" };
  }

  if (liveAuction.version !== currentVersion) {
    return { ok: false as const, status: 409, message: "Auction updated by another bidder" };
  }

  if (proposedBid <= liveAuction.currentHighestBidValue) {
    return { ok: false as const, status: 400, message: "Bid must exceed current highest bid" };
  }

  liveAuction.currentHighestBidValue = proposedBid;
  liveAuction.version += 1;
  liveAuction.totalBids += 1;
  liveAuction.currentBid = `Rs. ${proposedBid.toLocaleString()}`;
  liveAuction.nextMinBid = `Rs. ${(proposedBid + liveAuction.minBidIncrement).toLocaleString()}`;
  liveAuction.bidHistory = [["You", liveAuction.currentBid, "Just now"], ...liveAuction.bidHistory].slice(0, 6);

  return { ok: true as const, auction: liveAuction };
}

export const auctionRoomSummary = {
  liveRooms: 2,
  endingSoon: 1,
  upcoming: 1,
  totalWatchers: 133,
};

export const bidQuickAmounts = [2500, 5000, 7500, 10000];

export const auctionRules = [
  "Every new bid must meet the minimum increment.",
  "Buy It Now ends the auction immediately.",
  "Watchlist alerts will be delivered in real time.",
  "Sniping guard can extend the final countdown window.",
];