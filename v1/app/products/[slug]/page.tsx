import { notFound } from "next/navigation";
import { RouteShell } from "../../_components/route-shell";
import { productDetails } from "../../../lib/catalog";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = productDetails[slug as keyof typeof productDetails];

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 md:px-10 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <RouteShell
          eyebrow="Catalogue"
          title={product.title}
          description={product.description}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Gallery</p>
              <div className="mt-4 flex h-64 items-center justify-center rounded-2xl bg-white text-sm text-slate-500">Image gallery placeholder</div>
            </div>
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-sm text-slate-500">Brand</p>
                <p className="font-semibold text-slate-950">{product.brand}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">SKU</p>
                <p className="font-semibold text-slate-950">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="font-semibold text-slate-950">{product.price}</p>
                <p className="text-sm line-through text-slate-400">{product.originalPrice}</p>
                <p className="text-sm text-emerald-700">{product.discount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Stock</p>
                <p className="font-semibold text-slate-950">{product.stock}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Key specs</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {product.specs.map((spec) => (
                    <li key={spec}>• {spec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </RouteShell>
      </div>
    </main>
  );
}