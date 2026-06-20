"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  base_price: string;
  currency: string;
  category_id: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    if (!slug) return;
    router.replace(`/auctions?product=${slug}`);
  }, [router, slug]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-20 text-center">
        <div className="inline-flex max-w-3xl flex-col items-center gap-4 rounded-4xl border border-white/10 bg-white/5 p-12 text-slate-200 shadow-2xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.32em] text-sky-300">
            Product Redirect
          </p>
          <h1 className="text-4xl font-bold text-white">
            Loading product auction…
          </h1>
          <p className="text-base leading-7 text-slate-300">
            This product now opens inside the auctions page. Redirecting you
            there.
          </p>
          <p className="text-sm text-slate-400">
            If the redirect does not happen, use{" "}
            <a
              href="/auctions"
              className="font-semibold text-sky-200 underline"
            >
              this link
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
