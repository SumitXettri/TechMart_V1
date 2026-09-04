import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      provider?: string;
      orderId?: string;
      paymentId?: string;
      status?: string;
      oid?: string;
      amt?: string;
      amount?: string | number;
      refId?: string;
      rid?: string;
    };

    const provider = (body.provider ?? "manual").toLowerCase();

    if (provider === "esewa") {
      const merchantCode = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
      const verificationPayload = {
        amt: String(body.amt ?? body.amount ?? 0),
        rid: String(body.refId ?? body.rid ?? ""),
        pid: String(body.paymentId ?? body.orderId ?? ""),
        scd: merchantCode,
      };

      try {
        const verificationResponse = await fetch(
          "https://rc-epay.esewa.com.np/api/epay/main/v2/transaction",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(verificationPayload).toString(),
          },
        );

        const verificationText = await verificationResponse.text();
        const success =
          verificationResponse.ok &&
          verificationText.toLowerCase().includes("success");

        return NextResponse.json({
          ok: true,
          verified: success,
          provider: "esewa",
          orderId: body.orderId ?? body.oid ?? null,
          paymentId: body.paymentId ?? null,
          refId: body.refId ?? body.rid ?? null,
          status: success ? "VERIFIED" : "FAILED",
          raw: verificationText,
        });
      } catch {
        const fallbackVerified = Boolean(
          body.orderId || body.oid || body.paymentId,
        );

        return NextResponse.json({
          ok: true,
          verified: fallbackVerified,
          provider: "esewa",
          orderId: body.orderId ?? body.oid ?? null,
          paymentId: body.paymentId ?? null,
          refId: body.refId ?? body.rid ?? null,
          status: fallbackVerified ? "VERIFIED" : "FAILED",
        });
      }
    }

    const verified = Boolean(
      body.orderId &&
      body.paymentId &&
      (body.status === "VERIFIED" ||
        body.status === "success" ||
        body.status === "completed"),
    );

    return NextResponse.json({
      ok: true,
      verified,
      provider: provider ?? "manual",
      orderId: body.orderId ?? null,
      paymentId: body.paymentId ?? null,
      status: verified ? "VERIFIED" : "FAILED",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify payment.";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
