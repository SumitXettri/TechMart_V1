"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { generateUniqueSlug, slugify } from "../lib/slug";

export default function CreateAuctionForm() {
  const router = useRouter();
  const [userLoading, setUserLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [buyItNowPrice, setBuyItNowPrice] = useState("");
  const [bidIncrement, setBidIncrement] = useState("100");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolveCategoryId = async (slug: string) => {
    const { data: existingCategory, error: lookupError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existingCategory?.id) {
      return existingCategory.id;
    }

    const { data: newCategory, error: categoryError } = await supabase
      .from("categories")
      .insert([{ name: categoryName.trim(), slug }])
      .select("id")
      .single();

    if (categoryError) {
      if (
        categoryError.message.includes(
          "duplicate key value violates unique constraint",
        )
      ) {
        const { data: fallbackCategory, error: fallbackError } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (fallbackError) {
          throw fallbackError;
        }

        if (fallbackCategory?.id) {
          return fallbackCategory.id;
        }
      }

      throw categoryError;
    }

    return newCategory.id;
  };

  const checkSkuAvailable = async (skuValue: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("sku", skuValue)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return !data;
  };

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.replace("/login");
        return;
      }

      setUser(userData.user);
      setUserLoading(false);

      const { data, error: categoryError } = await supabase
        .from("categories")
        .select("id,name")
        .order("name", { ascending: true });

      if (categoryError) {
        setError(categoryError.message);
      } else if (data) {
        setCategories(data as Array<{ id: string; name: string }>);
      }
    };

    load();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (
      !productName.trim() ||
      !sku.trim() ||
      !basePrice ||
      !startPrice ||
      !startsAt ||
      !endsAt
    ) {
      setError("Please fill in all required auction and product fields.");
      return;
    }

    if (!categoryId && !categoryName.trim()) {
      setError("Choose an existing category or provide a new one.");
      return;
    }

    const startValue = Number(startPrice);
    const reserveValue = reservePrice ? Number(reservePrice) : null;
    const buyValue = buyItNowPrice ? Number(buyItNowPrice) : null;
    const incrementValue = Number(bidIncrement) || 100;
    const baseValue = Number(basePrice);
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (isNaN(startValue) || isNaN(baseValue) || isNaN(incrementValue)) {
      setError("Price fields must be valid numbers.");
      return;
    }

    if (startDate >= endDate) {
      setError("End date must be later than the start date.");
      return;
    }

    setLoading(true);

    try {
      let finalCategoryId = categoryId;

      if (!finalCategoryId && categoryName.trim()) {
        const categorySlug = slugify(categoryName.trim());
        finalCategoryId = await resolveCategoryId(categorySlug);
      }

      const skuValue = sku.trim();
      const skuAvailable = await checkSkuAvailable(skuValue);
      if (!skuAvailable) {
        throw new Error(
          "SKU is already in use. Please choose a different SKU for this product.",
        );
      }

      const baseSlug = productSlug.trim() || slugify(productName);
      const finalSlug = await generateUniqueSlug(
        baseSlug,
        async (candidate) => {
          const { data: existing, error: lookupError } = await supabase
            .from("products")
            .select("id")
            .eq("slug", candidate)
            .maybeSingle();
          if (lookupError) throw lookupError;
          return Boolean(existing);
        },
      );
      const productInsert = {
        name: productName.trim(),
        slug: finalSlug,
        description: description.trim() || "No description provided.",
        brand: brand.trim() || null,
        sku: sku.trim(),
        category_id: finalCategoryId,
        base_price: baseValue,
        currency: "NPR",
      };

      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert([productInsert])
        .select("id")
        .single();

      if (productError) {
        throw new Error(productError.message);
      }

      const auctionStatus = startDate > new Date() ? "SCHEDULED" : "LIVE";
      const auctionInsert = {
        product_id: productData.id,
        start_price: startValue,
        reserve_price: reserveValue,
        buy_it_now_price: buyValue,
        bid_increment: incrementValue,
        current_price: startValue,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        status: auctionStatus,
      };

      const { error: auctionError } = await supabase
        .from("auctions")
        .insert([auctionInsert]);

      if (auctionError) {
        throw new Error(auctionError.message);
      }

      setMessage("Auction created successfully. Redirecting to auctions…");
      setTimeout(() => router.push("/auctions"), 1200);
    } catch (submitError: any) {
      setError(submitError?.message ?? String(submitError));
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-slate-300">
        Loading auction creation tools…
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/20"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Create a new auction
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Add a product and configure its auction listing. Your auction will be
          added to the public auction list.
        </p>
      </div>

      {message && (
        <div className="rounded-3xl bg-emerald-500/15 p-4 text-emerald-200">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-3xl bg-rose-500/10 p-4 text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">
            Product name
          </span>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Smartphone X13"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">SKU</span>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="TECH-X13"
            required
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">
            Product slug
          </span>
          <input
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="smartphone-x13"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Brand</span>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="TechMart"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-200">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          rows={4}
          placeholder="Describe the product and auction highlights."
        />
      </label>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Base price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="21000"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Category</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          >
            <option value="">Select existing category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              if (e.target.value) setCategoryId("");
            }}
            className="mt-3 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Or create a new category"
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">
            Start price
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">
            Reserve price
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={reservePrice}
            onChange={(e) => setReservePrice(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Optional"
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Buy it now</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={buyItNowPrice}
            onChange={(e) => setBuyItNowPrice(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Optional"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">
            Bid increment
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={bidIncrement}
            onChange={(e) => setBidIncrement(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Currency</span>
          <input
            value="NPR"
            disabled
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400"
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Starts at</span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Ends at</span>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
      >
        {loading ? "Creating auction…" : "Create auction"}
      </button>
    </form>
  );
}
