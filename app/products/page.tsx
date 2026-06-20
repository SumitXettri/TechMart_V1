"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  base_price: string;
  currency: string;
  category_id: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,slug,description,brand,base_price,currency,category_id",
        )
        .order("name", { ascending: true });

      if (error) {
        setError(error.message);
      } else if (data) {
        setProducts(data as Product[]);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="mb-10 space-y-3">
          <p className="text-sm uppercase tracking-[0.32em] text-sky-300">
            Products
          </p>
          <h1 className="text-4xl font-bold text-white">
            Browse auction products
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-300">
            Explore products with active auctions and open the auction detail
            page.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-slate-300">
            Loading products…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-200">
            <p className="font-semibold">Unable to load products</p>
            <p className="mt-2 text-sm text-rose-100">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-slate-300">
            No products have been added yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20"
              >
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-sky-300">
                    {product.brand ?? "TechMart"}
                  </p>
                  <h2 className="text-2xl font-semibold text-white">
                    {product.name}
                  </h2>
                  <p className="text-sm leading-6 text-slate-300 line-clamp-3">
                    {product.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-300">
                  <span>Price: NPR {product.base_price}</span>
                  <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-200">
                    {product.currency}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href = `/auctions?product=${product.slug}`)
                    }
                    className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    View auction
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
