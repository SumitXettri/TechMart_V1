import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  listCategories,
  listProducts,
  type ListProductsParams,
} from "@/lib/products-repo";
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
  const active = ["all", "active", "inactive"].includes(sp.active ?? "")
    ? (sp.active as ListProductsParams["active"])
    : undefined;
  const sort = ["created_at", "name", "base_price"].includes(sp.sort ?? "")
    ? (sp.sort as ListProductsParams["sort"])
    : undefined;
  const direction = ["asc", "desc"].includes(sp.direction ?? "")
    ? (sp.direction as ListProductsParams["direction"])
    : undefined;

  const result = await listProducts({
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 20,
    search: sp.search,
    categoryId: sp.categoryId,
    active,
    sort,
    direction,
  });
  const categories = await listCategories();

  const filterKey = [
    sp.page ?? "1",
    sp.search ?? "",
    sp.categoryId ?? "",
    sp.active ?? "all",
    sp.sort ?? "created_at",
    sp.direction ?? "desc",
  ].join("|");

  return (
    <ProductsTableClient
      key={filterKey}
      initialResult={result}
      categories={categories}
    />
  );
}
