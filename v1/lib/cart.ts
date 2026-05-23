export const cartItems = [
  {
    name: "Samsung Galaxy S24",
    variant: "256GB / Black",
    price: "Rs. 112,999",
    quantity: 1,
  },
  {
    name: "Sony WH-1000XM5",
    variant: "Wireless / Silver",
    price: "Rs. 54,999",
    quantity: 1,
  },
];

export const checkoutSteps = ["Shipping", "Delivery", "Payment", "Review", "Confirm"] as const;

export const cartSummary = {
  subtotal: "Rs. 167,998",
  shipping: "Calculated at checkout",
  tax: "Included at payment review",
  discount: "Not applied",
};

export const shippingOptions = [
  {
    name: "Standard delivery",
    estimate: "2-4 business days",
    price: "Rs. 250",
  },
  {
    name: "Express delivery",
    estimate: "Next business day",
    price: "Rs. 650",
  },
  {
    name: "Click & collect",
    estimate: "Pickup at store",
    price: "Free",
  },
];

export const paymentMethods = ["Card", "eSewa", "Khalti", "IME Pay", "Cash on Delivery"];

export const reservationNote = "Items are reserved for 14 minutes while checkout is in progress.";