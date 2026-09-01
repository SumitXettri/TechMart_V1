import { NextRequest, NextResponse } from "next/server";
import { createPaymentRequest, type PaymentProvider } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      orderId?: string;
      amount?: number;
      provider?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    };

    const orderId = body.orderId?.trim();
    const amount = Number(body.amount ?? 0);
    const provider = (
      body.provider ?? "manual"
    ).toLowerCase() as PaymentProvider;

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: "Order ID is required." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: "Payment amount must be greater than zero." },
        { status: 400 },
      );
    }

    if (
      provider === "esewa" &&
      (!process.env.ESEWA_MERCHANT_CODE ||
        /localhost|127\.0\.0\.1/i.test(
          process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "",
        ))
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "eSewa is not configured for this environment. Set a valid ESEWA_MERCHANT_CODE and a public NEXT_PUBLIC_APP_URL before using the live gateway.",
        },
        { status: 400 },
      );
    }

    const payment = createPaymentRequest({
      orderId,
      amount,
      provider,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
    });

    return NextResponse.json(payment);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to initialize payment.";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
