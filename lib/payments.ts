export type PaymentProvider = "esewa" | "khalti" | "manual";

export type CreatePaymentInput = {
  orderId: string;
  amount: number;
  provider: PaymentProvider;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export type CreatePaymentResult = {
  ok: true;
  provider: PaymentProvider;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: "NPR";
  status: "INITIATED";
  redirectUrl: string;
  providerUrl?: string;
  formData?: Record<string, string>;
  message: string;
};

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "http://localhost:3000";

function toAbsoluteUrl(path: string) {
  return new URL(path, baseUrl).toString();
}

export function createPaymentRequest({
  orderId,
  amount,
  provider,
  customerName = "Customer",
  customerEmail = "customer@example.com",
  customerPhone = "9800000000",
}: CreatePaymentInput): CreatePaymentResult {
  const normalizedProvider = provider.toLowerCase() as PaymentProvider;
  const paymentId = `${normalizedProvider.toUpperCase()}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const returnUrl = toAbsoluteUrl(
    `/payment/result?provider=${normalizedProvider}&orderId=${encodeURIComponent(orderId)}&paymentId=${encodeURIComponent(paymentId)}`,
  );
  const cancelUrl = toAbsoluteUrl(
    `/payment/cancel?provider=${normalizedProvider}&orderId=${encodeURIComponent(orderId)}&paymentId=${encodeURIComponent(paymentId)}`,
  );

  if (normalizedProvider === "esewa") {
    const merchantCode = process.env.ESEWA_MERCHANT_CODE;
    const configuredMerchantCode = merchantCode?.trim();
    const hasPublicCallback = !/localhost|127\.0\.0\.1/i.test(baseUrl);

    if (!configuredMerchantCode || !hasPublicCallback) {
      throw new Error(
        "eSewa is not configured for this environment. Set ESEWA_MERCHANT_CODE and a public NEXT_PUBLIC_APP_URL (not localhost) before using the live gateway.",
      );
    }

    const payload: Record<string, string> = {
      amt: amount.toFixed(2),
      pdc: "0",
      psc: "0",
      txAmt: "0",
      tAmt: amount.toFixed(2),
      pid: paymentId,
      scd: configuredMerchantCode,
      su: returnUrl,
      fu: cancelUrl,
    };

    return {
      ok: true,
      provider: "esewa",
      orderId,
      paymentId,
      amount,
      currency: "NPR",
      status: "INITIATED",
      redirectUrl: returnUrl,
      providerUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      formData: payload,
      message:
        "eSewa checkout initialized. Use your real merchant credentials in .env.local for production.",
    };
  }

  if (normalizedProvider === "khalti") {
    const payload: Record<string, string> = {
      amount: String(Math.round(amount * 100)),
      purchase_order_id: orderId,
      purchase_order_name: `TechMart Order ${orderId}`,
      customer_info: JSON.stringify({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      }),
      return_url: returnUrl,
      website_url: baseUrl,
    };

    return {
      ok: true,
      provider: "khalti",
      orderId,
      paymentId,
      amount,
      currency: "NPR",
      status: "INITIATED",
      redirectUrl: returnUrl,
      providerUrl: "https://khalti.com/api/v2/epayment/initiate/",
      formData: payload,
      message: "Khalti checkout initialized.",
    };
  }

  const testedRedirect = toAbsoluteUrl(
    `/payment/result?provider=${normalizedProvider}&orderId=${encodeURIComponent(orderId)}&paymentId=${encodeURIComponent(paymentId)}&demo=1`,
  );

  return {
    ok: true,
    provider: "manual",
    orderId,
    paymentId,
    amount,
    currency: "NPR",
    status: "INITIATED",
    redirectUrl: testedRedirect,
    message:
      "Manual checkout is active. This demo-ready flow can be replaced with your live gateway credentials.",
  };
}
