type PaymentResultPageProps = {
  searchParams: Promise<{
    provider?: string;
    orderId?: string;
    paymentId?: string;
    oid?: string;
    refId?: string;
    demo?: string;
  }>;
};

export default async function PaymentResultPage({
  searchParams,
}: PaymentResultPageProps) {
  const params = await searchParams;
  const provider = params.provider ?? "esewa";
  const orderId = params.orderId ?? params.oid ?? "N/A";
  const paymentId = params.paymentId ?? "N/A";
  const refId = params.refId ?? "N/A";
  const demo = params.demo === "1";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-4xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center shadow-xl shadow-emerald-900/10">
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">
          Payment status
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white">
          Payment successful
        </h1>
        <p className="mt-4 text-base text-emerald-100">
          Your {provider.toUpperCase()} payment has been accepted for order{" "}
          {orderId}.
        </p>
        <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-slate-900/70 p-4 text-left text-sm text-slate-200">
          <p>
            <span className="font-semibold text-white">Order ID:</span>{" "}
            {orderId}
          </p>
          <p>
            <span className="font-semibold text-white">Payment ID:</span>{" "}
            {paymentId}
          </p>
          <p>
            <span className="font-semibold text-white">Reference ID:</span>{" "}
            {refId}
          </p>
          <p>
            <span className="font-semibold text-white">Mode:</span>{" "}
            {demo ? "Demo verification" : "eSewa callback"}
          </p>
        </div>
      </section>
    </main>
  );
}
