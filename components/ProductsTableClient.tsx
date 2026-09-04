"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ListProductsResult } from "@/lib/products-repo";

type Category = { id: string; name: string };

type ProductForm = {
  sku: string;
  name: string;
  description: string;
  brand: string;
  categoryId: string;
  basePrice: string;
  currency: string;
  isActive: boolean;
};

const EMPTY_PRODUCT: ProductForm = {
  sku: "",
  name: "",
  description: "",
  brand: "",
  categoryId: "",
  basePrice: "",
  currency: "USD",
  isActive: true,
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function ProductsTableClient({
  initialResult,
  categories,
}: {
  initialResult: ListProductsResult;
  categories: Category[];
}) {
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_PRODUCT);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function submitFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of values.entries()) {
      if (typeof value === "string" && value) params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateSort(sort: "created_at" | "name" | "base_price") {
    const params = new URLSearchParams(searchParams.toString());
    const currentSort = params.get("sort");
    params.set("sort", sort);
    params.set(
      "direction",
      currentSort === sort && params.get("direction") === "asc"
        ? "desc"
        : "asc",
    );
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  function openCreateModal() {
    setError(null);
    setForm(EMPTY_PRODUCT);
    setIsCreateOpen(true);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          brand: form.brand || undefined,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? "Failed to create product.");
        return;
      }

      setResult((previous) => ({
        ...previous,
        products: [data, ...previous.products].slice(0, previous.pageSize),
        total: previous.total + 1,
      }));
      setIsCreateOpen(false);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setError(null);
    setSavingId(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (res.status === 409) {
      const archive = confirm(
        `${data.error}\n\nArchive it instead (set inactive)?`,
      );
      if (archive) {
        await toggleActive(id, false);
      }
      setSavingId(null);
      return;
    }

    if (!res.ok) {
      setError(data.error ?? "Failed to delete product.");
      setSavingId(null);
      return;
    }

    setResult((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
      total: prev.total - 1,
    }));
    setSavingId(null);
  }

  async function toggleActive(id: string, isActive: boolean) {
    setError(null);
    setSavingId(id);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to update product.");
      return;
    }
    setResult((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === id ? { ...p, isActive: data.isActive } : p,
      ),
    }));
    setSavingId(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Catalog control
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your storefront assortment accurate and ready to sell.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800"
        >
          View storefront
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total products
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {result.total}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active on store
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {result.products.filter((product) => product.isActive).length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Needs attention
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {result.products.filter((product) => !product.isActive).length}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={openCreateModal}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        <span className="text-lg leading-none">+</span>
        Add product
      </button>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <form
          onSubmit={submitFilters}
          className="grid gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-[minmax(0,1fr)_180px_150px_auto] sm:items-end"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Search catalog
            </span>
            <input
              name="search"
              defaultValue={searchParams.get("search") ?? ""}
              placeholder="Name, SKU, or brand"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Category
            </span>
            <select
              name="categoryId"
              defaultValue={searchParams.get("categoryId") ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Status
            </span>
            <select
              name="active"
              defaultValue={searchParams.get("active") ?? "all"}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Apply
            </button>
            <Link
              href="/admin/products"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Reset
            </Link>
          </div>
        </form>

        {error ? (
          <div
            role="alert"
            className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-950">Inventory</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Showing {result.products.length} of {result.total} products
            </p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            Live catalog
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">
                  <button type="button" onClick={() => updateSort("name")}>
                    Product
                  </button>
                </th>
                <th className="px-5 py-3 font-semibold">Category / SKU</th>
                <th className="px-5 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => updateSort("base_price")}
                  >
                    Price
                  </button>
                </th>
                <th className="px-5 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => updateSort("created_at")}
                  >
                    Added
                  </button>
                </th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {result.products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <p className="font-semibold text-slate-900">
                      No products found
                    </p>
                    <p className="mt-1 text-slate-500">
                      Try adjusting the current filters.
                    </p>
                  </td>
                </tr>
              ) : (
                result.products.map((product) => {
                  const saving = savingId === product.id;
                  return (
                    <tr
                      key={product.id}
                      className="transition hover:bg-violet-50/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">
                          {product.name}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {product.brand ?? "Unbranded"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700">
                          {categories.find(
                            (category) => category.id === product.categoryId,
                          )?.name ?? "Uncategorized"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {product.sku}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                        {product.currency} {product.basePrice}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={product.isActive}
                            disabled={saving}
                            onChange={(event) =>
                              toggleActive(product.id, event.target.checked)
                            }
                            className="h-4 w-4 accent-violet-700"
                          />
                          <span
                            className={
                              product.isActive
                                ? "text-xs font-semibold text-emerald-700"
                                : "text-xs font-semibold text-slate-500"
                            }
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </label>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleDelete(product.id)}
                            className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm">
          <span className="text-slate-500">
            Page {result.page} of{" "}
            {Math.max(1, Math.ceil(result.total / result.pageSize))}
          </span>
          <div className="flex gap-2">
            <Link
              href={result.page > 1 ? pageHref(result.page - 1) : "#"}
              aria-disabled={result.page <= 1}
              className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-600 aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              Previous
            </Link>
            <Link
              href={
                result.page < Math.ceil(result.total / result.pageSize)
                  ? pageHref(result.page + 1)
                  : "#"
              }
              aria-disabled={
                result.page >= Math.ceil(result.total / result.pageSize)
              }
              className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-600 aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              Next
            </Link>
          </div>
        </div>
      </div>

      {isCreateOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsCreateOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-product-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  New inventory item
                </p>
                <h2
                  id="create-product-title"
                  className="mt-2 text-2xl font-semibold tracking-tight text-slate-950"
                >
                  Add a product
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create the listing details that will appear in your
                  storefront.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                aria-label="Close dialog"
                className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                x
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Product name *
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Wireless headphones"
                  className="admin-product-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  SKU *
                </span>
                <input
                  required
                  value={form.sku}
                  onChange={(event) =>
                    setForm({ ...form, sku: event.target.value })
                  }
                  placeholder="TECH-1001"
                  className="admin-product-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Brand
                </span>
                <input
                  value={form.brand}
                  onChange={(event) =>
                    setForm({ ...form, brand: event.target.value })
                  }
                  placeholder="TechMart"
                  className="admin-product-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Category *
                </span>
                <select
                  required
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm({ ...form, categoryId: event.target.value })
                  }
                  className="admin-product-input"
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
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Price *
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(event) =>
                    setForm({ ...form, basePrice: event.target.value })
                  }
                  placeholder="99.00"
                  className="admin-product-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Currency
                </span>
                <select
                  value={form.currency}
                  onChange={(event) =>
                    setForm({ ...form, currency: event.target.value })
                  }
                  className="admin-product-input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Description *
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe the product for customers"
                  className="admin-product-input resize-y"
                />
              </label>
              <label className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({ ...form, isActive: event.target.checked })
                  }
                  className="h-4 w-4 accent-violet-700"
                />
                <span className="text-sm font-medium text-slate-700">
                  Publish as active product
                </span>
              </label>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {isCreating ? "Adding product..." : "Add product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
