"use client";

import { useEffect, useState } from "react";
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

type Category = {
  id: string;
  name: string;
};

type ProductForm = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category_id: string;
  base_price: string;
  currency: string;
  is_active: boolean;
};

const emptyProductForm: ProductForm = {
  sku: "",
  name: "",
  slug: "",
  description: "",
  brand: "",
  category_id: "",
  base_price: "",
  currency: "NPR",
  is_active: true,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const [{ data, error }, { data: categoryData, error: categoryError }] =
        await Promise.all([
          supabase
            .from("products")
            .select(
              "id,name,slug,description,brand,base_price,currency,category_id",
            )
            .order("name", { ascending: true }),
          supabase.from("categories").select("id,name").order("name"),
        ]);

      if (error) {
        setError(error.message);
      } else if (data) {
        setProducts(data as Product[]);
      }

      if (categoryError) {
        setError(categoryError.message);
      } else if (categoryData) {
        setCategories(categoryData as Category[]);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  const updateForm = <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaveMessage(null);

    const basePrice = Number(form.base_price);
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      setError("Base price must be a valid non-negative number.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("products")
      .insert({
        sku: form.sku.trim(),
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim(),
        brand: form.brand.trim() || null,
        category_id: form.category_id,
        base_price: basePrice,
        currency: form.currency.trim().toUpperCase(),
        is_active: form.is_active,
      })
      .select("id,name,slug,description,brand,base_price,currency,category_id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    if (data) {
      setProducts((current) =>
        [...current, data as Product].sort((left, right) =>
          left.name.localeCompare(right.name),
        ),
      );
    }
    setForm({ ...emptyProductForm, category_id: categories[0]?.id ?? "" });
    setShowCreateForm(false);
    setSaveMessage("Product added successfully.");
    setSaving(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.brand ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase().trim());
    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter;
    const matchesPrice =
      !maxPrice || Number(product.base_price) <= Number(maxPrice);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="store-page min-h-screen bg-[#f7f8f5] text-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
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
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSaveMessage(null);
              setForm({
                ...emptyProductForm,
                category_id: categories[0]?.id ?? "",
              });
              setShowCreateForm(true);
            }}
            disabled={categories.length === 0}
            className="rounded-full bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add product
          </button>
        </div>

        {saveMessage ? (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            {saveMessage}
          </div>
        ) : null}

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
          <>
            <div className="mb-8 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_0.8fr_0.7fr]">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Search products
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name or brand"
                  className="w-full rounded-xl border border-white/10 bg-slate-50 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Category
                </span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-50 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Maximum price
                </span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Any price"
                  className="w-full rounded-xl border border-white/10 bg-slate-50 px-4 py-3 text-sm text-white focus:border-sky-400"
                />
              </label>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-slate-300">
                No products match these filters.
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-3">
              {filteredProducts.map((product) => (
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
                    <p className="line-clamp-3 text-sm leading-6 text-slate-300">
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
          </>
        )}
      </main>

      {showCreateForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4">
          <form
            onSubmit={handleCreate}
            className="my-8 w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-sky-300">Catalog</p>
                <h2 className="text-2xl font-semibold text-white">
                  Add product
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {(["sku", "name", "slug", "brand"] as const).map((field) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {field === "sku"
                      ? "SKU"
                      : field[0].toUpperCase() + field.slice(1)}
                  </span>
                  <input
                    required={field !== "brand"}
                    value={form[field]}
                    onChange={(event) => updateForm(field, event.target.value)}
                    placeholder={
                      field === "slug"
                        ? "Generated from name if empty"
                        : undefined
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400"
                  />
                </label>
              ))}
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Category
                </span>
                <select
                  required
                  value={form.category_id}
                  onChange={(event) =>
                    updateForm("category_id", event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400"
                >
                  <option value="">Choose category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Base price
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.base_price}
                  onChange={(event) =>
                    updateForm("base_price", event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Currency
                </span>
                <input
                  required
                  maxLength={3}
                  value={form.currency}
                  onChange={(event) =>
                    updateForm("currency", event.target.value.toUpperCase())
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400"
                />
              </label>
              <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium text-slate-200">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    updateForm("is_active", event.target.checked)
                  }
                  className="h-4 w-4 accent-sky-400"
                />{" "}
                Active product
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Description
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400"
                />
              </label>
            </div>
            {error ? (
              <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add product"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
