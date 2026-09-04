import { z } from "zod";
import { requireAdmin, AuthError } from "@/lib/auth";
import { isSameOrigin, csrfRejectionResponse } from "@/lib/csrf";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  ProductDependencyError,
} from "@/lib/products-repo";

const updateProductSchema = z.object({
  sku: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  brand: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  basePrice: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "basePrice must be a decimal string, e.g. 1250.00",
    )
    .optional(),
  currency: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return Response.json({ error: "Product not found." }, { status: 404 });
  }
  return Response.json(product);
}

export async function PUT(request: Request, { params }: RouteContext) {
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

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateProduct(id, parsed.data);
    return Response.json(updated);
  } catch (err: any) {
    return Response.json(
      { error: err.message ?? "Failed to update product." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
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

  const { id } = await params;

  try {
    await deleteProduct(id);
    return Response.json({ ok: true });
  } catch (err: any) {
    if (err instanceof ProductDependencyError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    return Response.json(
      { error: err.message ?? "Failed to delete product." },
      { status: 400 },
    );
  }
}
