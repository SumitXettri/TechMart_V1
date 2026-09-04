"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminProduct, ProductCategory } from "@/lib/products-repo";

type ProductForm = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  basePrice: string;
  currency: string;
  isActive: boolean;
};

type Props = {
  products: AdminProduct[];
  categories: ProductCategory[];
  total: number;
};

const emptyForm = (categoryId = ""): ProductForm => ({
  sku: "",
  name: "",
  slug: "",
  description: "",
  brand: "",
  categoryId,
  categoryName: "",
  basePrice: "",
  currency: "NPR",
  isActive: true,
});

function formFromProduct(product: AdminProduct): ProductForm {
  return {
    sku: product.sku,
    name: product.name,
    slug: product.slug ?? "",
    description: product.description,
    brand: product.brand ?? "",
    categoryId: product.category_id,
    categoryName: "",
    basePrice: product.base_price,
    currency: product.currency,
    isActive: product.is_active,
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function ProductManagementTable({ products, categories, total }: Props) {
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [form, setForm] = useState<ProductForm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openCreate = () => {
    setErrorMessage(null);
    setEditingProduct(null);
    setForm(emptyForm(categories[0]?.id ?? "__new__"));
  };

  const openEdit = (product: AdminProduct) => {
    setErrorMessage(null);
    setEditingProduct(product);
    setForm(formFromProduct(product));
  };

  const closeForm = () => {
    setForm(null);
    setEditingProduct(null);
    setErrorMessage(null);
  };

  const updateField = <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const response = await fetch(
        editingProduct
          ? `/api/admin/products/${editingProduct.id}`
          : "/api/admin/products",
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            basePrice: form.basePrice,
            categoryId: form.categoryId === "__new__" ? "" : form.categoryId,
            categoryName:
              form.categoryId === "__new__" ? form.categoryName : undefined,
          }),
        },
      );
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok)
        throw new Error(data?.error ?? "Unable to save product.");
      closeForm();
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin/products/${deleteId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok)
        throw new Error(data?.error ?? "Unable to delete product.");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No products match the current filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.sku} · {product.brand || "No brand"}
                      </p>
                    </td>
                    <td className="px-4 py-3">{product.category_name}</td>
                    <td className="px-4 py-3 font-medium">
                      {product.currency} {product.base_price}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.is_active
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                        }
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(product.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/60">
        <span className="text-sm text-slate-500">
          {total} {total === 1 ? "product" : "products"}
        </span>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create product
        </button>
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <form
            onSubmit={save}
            className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Catalog management
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {editingProduct ? "Edit product" : "Add product"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {(["sku", "name", "slug", "brand"] as const).map((field) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {field === "sku"
                      ? "SKU"
                      : field[0].toUpperCase() + field.slice(1)}
                  </span>
                  <input
                    required={field !== "brand" && field !== "slug"}
                    value={form[field]}
                    onChange={(event) => updateField(field, event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </label>
              ))}
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Category
                </span>
                <select
                  required
                  value={form.categoryId}
                  onChange={(event) =>
                    updateField("categoryId", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="">Choose category</option>
                  <option value="__new__">Create new category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {form.categoryId === "__new__" ? (
                  <input
                    required
                    value={form.categoryName}
                    onChange={(event) =>
                      updateField("categoryName", event.target.value)
                    }
                    placeholder="New category name"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                  />
                ) : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Base price
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.basePrice}
                  onChange={(event) =>
                    updateField("basePrice", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Currency
                </span>
                <input
                  maxLength={3}
                  required
                  value={form.currency}
                  onChange={(event) =>
                    updateField("currency", event.target.value.toUpperCase())
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                />
              </label>
              <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                  className="h-4 w-4 accent-slate-900"
                />{" "}
                Active product
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Description
                </span>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                />
              </label>
            </div>
            {errorMessage ? (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save product"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-900">
              Delete product?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Products used by auctions or orders cannot be removed.
            </p>
            {errorMessage ? (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={saving}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
