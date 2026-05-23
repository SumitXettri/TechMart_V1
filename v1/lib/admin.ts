export const adminStats = [
  { label: "Revenue today", value: "Rs. 1.28M" },
  { label: "Orders pending", value: "18" },
  { label: "Low stock SKUs", value: "6" },
  { label: "Active auctions", value: "2" },
];

export const inventoryRows = [
  {
    sku: "SM-S24-256-BLK",
    name: "Samsung Galaxy S24",
    category: "Smartphones",
    stock: 48,
    status: "Healthy",
  },
  {
    sku: "LEG-PRO7-4090",
    name: "Lenovo Legion Pro 7",
    category: "Laptops",
    stock: 3,
    status: "Low stock",
  },
  {
    sku: "SONY-WHXM5-BLK",
    name: "Sony WH-1000XM5",
    category: "Audio",
    stock: 12,
    status: "Healthy",
  },
];

export const bulkImportTemplate = [
  "sku,name,category,price,stock",
  "SM-S25-256-BLK,Samsung Galaxy S25,Smartphones,119999,20",
  "SONY-ULT-WH3,Sony ULT Wear,Audio,29999,30",
].join("\n");

export const adminQuickActions = [
  "Add product",
  "Bulk import",
  "Publish discount",
  "Adjust stock",
  "Create auction",
];

export const adminAnalytics = [
  {
    label: "Gross platform revenue",
    value: "Rs. 4,892,500.00",
    delta: "+14.2%",
    tone: "positive",
  },
  {
    label: "Active live auctions",
    value: "38 blocks",
    delta: "6 ending soon",
    tone: "positive",
  },
  {
    label: "Average order value",
    value: "Rs. 64,200.00",
    delta: "-2.1%",
    tone: "negative",
  },
  {
    label: "Cache hit rate",
    value: "98.42%",
    delta: "Sub-200ms latency",
    tone: "positive",
  },
];

export const adminAlerts = [
  {
    type: "CRITICAL",
    msg: "Inventory below safety margins for SKU: TM-MBP14M3X-09 (Pokhara Branch Hub)",
    time: "3 mins ago",
  },
  {
    type: "INFO",
    msg: "Async worker cluster scaled smoothly to +3 instances during flash traffic spike.",
    time: "14 mins ago",
  },
];

export const liveAuctionRows = [
  { id: "AUC-902", item: "iPhone 15 Pro Max (256GB)", highBid: 165000, bids: 24, status: "Live" },
  { id: "AUC-905", item: "ASUS ROG Zephyrus G14", highBid: 245000, bids: 41, status: "Sniping Guard Active" },
  { id: "AUC-909", item: "Sony WH-1000XM5 ANC", highBid: 38000, bids: 12, status: "Upcoming" },
];

export const adminOperations = [
  { label: "API latency", value: "42ms (p95)" },
  { label: "DB conn pool", value: "14 / 100 alloc" },
  { label: "Queue depth", value: "6 jobs" },
  { label: "Retry rate", value: "0.2%" },
];
