import { NextResponse } from "next/server";
import { checkoutSteps, paymentMethods, reservationNote, shippingOptions } from "../../../../lib/cart";

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      checkoutSteps,
      shippingOptions,
      paymentMethods,
      reservationNote,
    },
  });
}