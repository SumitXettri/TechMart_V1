"use client";

import { useState } from "react";
import type { ListProductsResult } from "@/lib/products-repo";

export default function ProductsTableClient({
  initialResult,
}: {
  initialResult: ListProductsResult;
}) {
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.status === 409) {
      const archive = confirm(
        `${data.error}\n\nArchive it instead (set inactive)?`,
      );
      if (archive) {
        await toggleActive(id, false);
      }
      return;
    }

    if (!res.ok) {
      setError(data.error ?? "Failed to delete product.");
      return;
    }

    setResult((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
      total: prev.total - 1,
    }));
  }

  async function toggleActive(id: string, isActive: boolean) {
    setError(null);
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
  }

  return (
    <main>
      <h1>Products ({result.total})</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Active</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {result.products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>
                {p.currency} {p.basePrice}
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={p.isActive}
                  onChange={(e) => toggleActive(p.id, e.target.checked)}
                />
              </td>
              <td>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
