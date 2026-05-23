export const profileSummary = {
  name: "Hami Teen Bhai",
  email: "hami@example.com",
  phone: "+977-9800000000",
  loyaltyPoints: 1240,
  loyaltyTier: "Silver",
  defaultAddress: "Kathmandu, Bagmati Province",
};

export const savedAddresses = [
  {
    id: "addr-home",
    label: "Home",
    name: "Hami Teen Bhai",
    line1: "Maitidevi Marg",
    city: "Kathmandu",
    region: "Bagmati",
    postalCode: "44600",
    default: true,
  },
  {
    id: "addr-office",
    label: "Office",
    name: "TechMart Ops Team",
    line1: "Durbar Marg",
    city: "Kathmandu",
    region: "Bagmati",
    postalCode: "44601",
    default: false,
  },
];

export const profileStats = [
  { label: "Loyalty points", value: "1,240" },
  { label: "Saved addresses", value: "2" },
  { label: "Open orders", value: "3" },
  { label: "Wishlist items", value: "7" },
];

export const recentOrders = [
  {
    id: "TM-100245",
    item: "Samsung Galaxy S24",
    status: "Delivered",
    total: "Rs. 112,999",
    date: "21/05/2026",
  },
  {
    id: "TM-100244",
    item: "Sony WH-1000XM5",
    status: "Shipped",
    total: "Rs. 54,999",
    date: "19/05/2026",
  },
  {
    id: "TM-100243",
    item: "Lenovo Legion Pro 7",
    status: "Processing",
    total: "Rs. 289,999",
    date: "18/05/2026",
  },
];

export const searchResults = [
  {
    title: "Samsung Galaxy S24",
    category: "Products",
    note: "Best match for 'samsing' style fuzzy queries.",
  },
  {
    title: "Samsung",
    category: "Brands",
    note: "Brand suggestion with smartphones and accessories.",
  },
  {
    title: "Smartphones & Tablets",
    category: "Categories",
    note: "Browse the full mobile catalog.",
  },
];