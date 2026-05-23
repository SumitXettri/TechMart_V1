import Link from "next/link";
import { RouteShell } from "../_components/route-shell";
import { featuredProducts } from "../../lib/catalog";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <RouteShell
          eyebrow="Catalogue"
          title="Products"
          description="Catalogue starter for category browsing, filtering, sorting, and product detail navigation."
        >
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Filters</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-white px-4 py-3">Brand, price, rating, and availability filters</div>
                <div className="rounded-2xl bg-white px-4 py-3">Technical spec filters for tech categories</div>
                <div className="rounded-2xl bg-white px-4 py-3">Sort options and pagination controls</div>
              </div>
            </aside>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link key={product.slug} href={`/products/${product.slug}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{product.badge}</p>
                  <h2 className="mt-3 text-lg font-bold text-slate-950">{product.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{product.brand} • {product.category}</p>
                  <p className="mt-3 text-base font-semibold text-slate-900">{product.price}</p>
                  <p className="text-sm line-through text-slate-400">{product.originalPrice}</p>
                  <p className="mt-3 text-sm text-slate-600">{product.description}</p>
                  <p className="mt-4 text-sm font-medium text-emerald-700">{product.stock}</p>
                </Link>
              ))}
            </div>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}