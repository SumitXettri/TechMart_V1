"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { supabase } from "../../../lib/supabaseClient";

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

type ProductVariant = {
  id: string;
  name: string;
  price_delta: number;
  stock_qty: number;
  sku: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const loadProduct = async () => {
      const { data, error: productError } = await supabase
        .from("products")
        .select(
          "id,name,slug,description,brand,base_price,currency,category_id",
        )
        .eq("slug", slug)
        .single();
      if (productError || !data) {
        setError(productError?.message ?? "Product not found.");
        setLoading(false);
        return;
      }
      setProduct(data as ProductDetail);
      const { data: variantData } = await supabase
        .from("product_variants")
        .select("id,name,price_delta,stock_qty,sku")
        .eq("product_id", data.id)
        .order("name");
      const loadedVariants = (variantData ?? []) as ProductVariant[];
      setVariants(loadedVariants);
      setSelectedVariant(
        loadedVariants.find((item) => item.stock_qty > 0)?.id ?? "",
      );
      setLoading(false);
    };
    loadProduct();
  }, [slug]);

  const activeVariant = variants.find(
    (variant) => variant.id === selectedVariant,
  );
  const displayPrice = useMemo(
    () =>
      Number(product?.base_price ?? 0) +
      Number(activeVariant?.price_delta ?? 0),
    [activeVariant?.price_delta, product?.base_price],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        {loading ? <p className="text-slate-300">Loading product...</p> : null}
        {error ? (
          <p className="rounded-2xl bg-rose-500/10 p-6 text-rose-200">
            {error}
          </p>
        ) : null}
        {product ? (
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex min-h-[28rem] items-center justify-center rounded-4xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950 p-10">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
                  {product.brand ?? "TechMart"}
                </p>
                <div className="mt-8 text-8xl">▣</div>
                <p className="mt-8 text-sm text-slate-400">
                  SKU: {product.slug}
                </p>
              </div>
            </div>
            <section>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
                Product details
              </p>
              <h1 className="mt-3 text-4xl font-bold text-white">
                {product.name}
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300">
                {product.description}
              </p>
              <p className="mt-8 text-3xl font-bold text-white">
                {product.currency} {displayPrice.toFixed(2)}
              </p>
              {variants.length > 0 ? (
                <fieldset className="mt-8">
                  <legend className="text-sm font-semibold text-white">
                    Select property
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {variants.map((variant) => (
                      <label
                        key={variant.id}
                        className={`cursor-pointer rounded-2xl border p-4 ${selectedVariant === variant.id ? "border-sky-400 bg-sky-400/10" : "border-white/10 bg-white/5"}`}
                      >
                        <input
                          type="radio"
                          name="variant"
                          value={variant.id}
                          checked={selectedVariant === variant.id}
                          onChange={() => setSelectedVariant(variant.id)}
                          disabled={variant.stock_qty < 1}
                          className="sr-only"
                        />
                        <span className="font-semibold text-white">
                          {variant.name}
                        </span>
                        <span className="mt-1 block text-sm text-slate-400">
                          {variant.stock_qty > 0
                            ? `${variant.stock_qty} available`
                            : "Out of stock"}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`/auctions?product=${product.slug}`}
                  className="rounded-full bg-sky-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-sky-300"
                >
                  View auction
                </a>
                <a
                  href="/checkout"
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Buy securely
                </a>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
