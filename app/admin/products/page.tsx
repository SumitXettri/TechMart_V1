import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/products-repo";
import ProductsTableClient from "@/components/ProductsTableClient";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    active?: string;
    sort?: string;
    direction?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
  const sp = await searchParams;

  const result = await listProducts({
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 20,
    search: sp.search,
    categoryId: sp.categoryId,
    active: sp.active as any,
    sort: sp.sort as any,
    direction: sp.direction as any,
  });

  return <ProductsTableClient initialResult={result} />;
}
