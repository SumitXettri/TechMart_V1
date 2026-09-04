import { z } from "zod";
import { requireAdmin, AuthError } from "@/lib/auth";
import { isSameOrigin, csrfRejectionResponse } from "@/lib/csrf";
import { listProducts, createProduct } from "@/lib/products-repo";

const createProductSchema = z
  .object({
    sku: z.string().trim().min(1),
    name: z.string().trim().min(1),
    slug: z.string().trim().optional(),
    description: z.string().trim().min(1),
    brand: z.string().trim().optional(),
    categoryId: z.string().trim().optional(),
    categoryName: z.string().trim().optional(),
    basePrice: z
      .string()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "basePrice must be a decimal string, e.g. 1250.00",
      ),
    currency: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.categoryId || data.categoryName, {
    message: "Either categoryId or categoryName is required.",
    path: ["categoryId"],
  });

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const url = new URL(request.url);
  const params = {
    page: Number(url.searchParams.get("page") ?? "1"),
    pageSize: Number(url.searchParams.get("pageSize") ?? "20"),
    search: url.searchParams.get("search") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    active: (url.searchParams.get("active") as any) ?? undefined,
    sort: (url.searchParams.get("sort") as any) ?? undefined,
    direction: (url.searchParams.get("direction") as any) ?? undefined,
  };

  try {
    const result = await listProducts(params);
    return Response.json(result);
  } catch (err: any) {
    return Response.json(
      { error: err.message ?? "Failed to list products." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  if (!isSameOrigin(request)) {
    return csrfRejectionResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  try {
    const product = await createProduct(parsed.data);
    return Response.json(product, { status: 201 });
  } catch (err: any) {
    return Response.json(
      { error: err.message ?? "Failed to create product." },
      { status: 400 },
    );
  }
}
