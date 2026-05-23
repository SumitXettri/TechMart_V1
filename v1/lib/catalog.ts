export type ProductSummary = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string;
  rating: number;
  stock: string;
  badge: string;
  description: string;
};

export const featuredProducts: ProductSummary[] = [
  {
    slug: "samsung-galaxy-s24",
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    category: "Smartphones",
    price: "Rs. 112,999",
    originalPrice: "Rs. 124,999",
    rating: 4.8,
    stock: "In stock",
    badge: "Bestseller",
    description: "Flagship Android phone with dynamic AMOLED display, AI tools, and all-day battery.",
  },
  {
    slug: "lenovo-legion-pro-7",
    name: "Lenovo Legion Pro 7",
    brand: "Lenovo",
    category: "Laptops",
    price: "Rs. 289,999",
    originalPrice: "Rs. 319,999",
    rating: 4.7,
    stock: "Only 3 left",
    badge: "Gaming",
    description: "High-performance gaming laptop with RTX graphics and a 240Hz display.",
  },
  {
    slug: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Audio",
    price: "Rs. 54,999",
    originalPrice: "Rs. 59,999",
    rating: 4.9,
    stock: "In stock",
    badge: "Top rated",
    description: "Noise-cancelling headphones with premium audio and long battery life.",
  },
];

export const productDetails = {
  "samsung-galaxy-s24": {
    title: "Samsung Galaxy S24",
    brand: "Samsung",
    sku: "SM-S24-256-BLK",
    price: "Rs. 112,999",
    originalPrice: "Rs. 124,999",
    discount: "10% off",
    stock: "In Stock",
    description: "Flagship Android smartphone with AI-assisted productivity and a vibrant 6.2-inch display.",
    specs: ["6.2-inch AMOLED display", "8GB RAM", "256GB storage", "50MP main camera"],
  },
  "lenovo-legion-pro-7": {
    title: "Lenovo Legion Pro 7",
    brand: "Lenovo",
    sku: "LEG-PRO7-4090",
    price: "Rs. 289,999",
    originalPrice: "Rs. 319,999",
    discount: "9% off",
    stock: "Only 3 left",
    description: "Premium gaming laptop built for high refresh-rate gaming and creator workloads.",
    specs: ["16-inch display", "RTX graphics", "32GB RAM", "1TB SSD"],
  },
  "sony-wh-1000xm5": {
    title: "Sony WH-1000XM5",
    brand: "Sony",
    sku: "SONY-WHXM5-BLK",
    price: "Rs. 54,999",
    originalPrice: "Rs. 59,999",
    discount: "8% off",
    stock: "In Stock",
    description: "Noise-cancelling headphones with premium tuning and comfort for long listening sessions.",
    specs: ["30-hour battery", "Adaptive noise cancelling", "Bluetooth 5.2", "USB-C charging"],
  },
} as const;