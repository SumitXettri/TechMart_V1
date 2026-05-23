import { NextResponse } from "next/server";
import { cartItems, cartSummary, paymentMethods, shippingOptions } from "../../../../lib/cart";

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      items: cartItems,
      summary: cartSummary,
      shippingOptions,
      paymentMethods,
    },
  });
}