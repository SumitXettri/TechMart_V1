import { query, withTransaction, isDatabaseConfigured } from "./db";
import { supabaseAdmin } from "./supabaseAdmin";
import { generateUniqueSlug, normalizeSlug } from "./slug";

/**
 * lib/products-repo.ts
 * PostgreSQL primary path with Supabase fallback, matching the same
 * pattern as lib/users-repo.ts. basePrice is always kept as a string to
 * avoid losing numeric(12,2) precision in JS floating point.
 */

export interface AdminProductRow {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  categoryId: string;
  basePrice: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory = {
  id: string;
  name: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  category_id: string;
  category_name: string;
  base_price: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  active?: "all" | "active" | "inactive";
  sort?: "created_at" | "name" | "base_price";
  direction?: "asc" | "desc";
}

export interface ListProductsResult {
  products: AdminProductRow[];
  total: number;
  page: number;
  pageSize: number;
}

function mapRow(row: Record<string, unknown>): AdminProductRow {
  return {
    id: String(row.id),
    sku: String(row.sku),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    brand: (row.brand as string | null) ?? null,
    categoryId: String(row.category_id),
    basePrice: String(row.base_price),
    currency: String(row.currency),
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listCategories(): Promise<
  { id: string; name: string; slug: string; parentId: string | null }[]
> {
  if (isDatabaseConfigured()) {
    try {
      const rows = await query<Record<string, unknown>>(
        `SELECT id, name, slug, parent_id FROM categories ORDER BY name ASC`,
      );
      return rows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        slug: String(r.slug),
        parentId: (r.parent_id as string | null) ?? null,
      }));
    } catch {
      // fall through
    }
  }
  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name");
  if (error) throw error;
  return (
    (data as CategoryRow[] | null)?.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      parentId: r.parent_id ?? null,
    })) ?? []
  );
}

export async function createCategory(name: string): Promise<string> {
  const slug = await generateUniqueSlug(name, async (candidate) => {
    if (isDatabaseConfigured()) {
      try {
        const rows = await query<{ id: string }>(
          `SELECT id FROM categories WHERE slug = $1`,
          [candidate],
        );
        return rows.length > 0;
      } catch {
        /* fall through to supabase check below */
      }
    }
    if (!supabaseAdmin) return false;
    const { data } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return !!data;
  });

  if (isDatabaseConfigured()) {
    try {
      const rows = await query<{ id: string }>(
        `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id`,
        [name, slug],
      );
      return rows[0].id;
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      )
        throw new Error("Category slug already exists.");
      throw err;
    }
  }

  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({ name, slug })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<ListProductsResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const sortColumn =
    params.sort === "name"
      ? "name"
      : params.sort === "base_price"
        ? "base_price"
        : "created_at";
  const direction = params.direction === "asc" ? "ASC" : "DESC";

  if (isDatabaseConfigured()) {
    try {
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (params.search) {
        values.push(`%${params.search}%`);
        conditions.push(
          `(name ILIKE $${values.length} OR sku ILIKE $${values.length} OR brand ILIKE $${values.length})`,
        );
      }
      if (params.categoryId) {
        values.push(params.categoryId);
        conditions.push(`category_id = $${values.length}`);
      }
      if (params.active === "active") {
        conditions.push(`is_active = true`);
      } else if (params.active === "inactive") {
        conditions.push(`is_active = false`);
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const countRows = await query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM products ${whereClause}`,
        values,
      );
      const total = Number(countRows[0]?.count ?? 0);

      values.push(pageSize, offset);
      const rows = await query<Record<string, unknown>>(
        `SELECT id, sku, name, slug, description, brand, category_id, base_price, currency, is_active, created_at, updated_at
         FROM products
         ${whereClause}
         ORDER BY ${sortColumn} ${direction}
         LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values,
      );

      return { products: rows.map(mapRow), total, page, pageSize };
    } catch {
      // fall through to Supabase
    }
  }

  if (!supabaseAdmin) throw new Error("No database connection is configured.");

  let sbQuery = supabaseAdmin
    .from("products")
    .select(
      "id, sku, name, slug, description, brand, category_id, base_price, currency, is_active, created_at, updated_at",
      { count: "exact" },
    );

  if (params.search) {
    sbQuery = sbQuery.or(
      `name.ilike.%${params.search}%,sku.ilike.%${params.search}%,brand.ilike.%${params.search}%`,
    );
  }
  if (params.categoryId) sbQuery = sbQuery.eq("category_id", params.categoryId);
  if (params.active === "active") sbQuery = sbQuery.eq("is_active", true);
  if (params.active === "inactive") sbQuery = sbQuery.eq("is_active", false);

  const { data, count, error } = await sbQuery
    .order(sortColumn, { ascending: direction === "ASC" })
    .range(offset, offset + pageSize - 1);
  if (error) throw error;

  return {
    products: (data ?? []).map(mapRow),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getProductById(
  id: string,
): Promise<AdminProductRow | null> {
  if (isDatabaseConfigured()) {
    try {
      const rows = await query<Record<string, unknown>>(
        `SELECT id, sku, name, slug, description, brand, category_id, base_price, currency, is_active, created_at, updated_at
         FROM products WHERE id = $1`,
        [id],
      );
      return rows[0] ? mapRow(rows[0]) : null;
    } catch {
      // fall through
    }
  }
  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "id, sku, name, slug, description, brand, category_id, base_price, currency, is_active, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  slug?: string;
  description: string;
  brand?: string;
  categoryId?: string;
  categoryName?: string;
  basePrice: string;
  currency?: string;
  isActive?: boolean;
}

async function slugExists(candidate: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      const rows = await query<{ id: string }>(
        `SELECT id FROM products WHERE slug = $1`,
        [candidate],
      );
      return rows.length > 0;
    } catch {
      /* fall through */
    }
  }
  if (!supabaseAdmin) return false;
  const { data } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", candidate)
    .maybeSingle();
  return !!data;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<AdminProductRow> {
  if (!input.categoryId && !input.categoryName) {
    throw new Error("Either categoryId or categoryName is required.");
  }

  const categoryId = input.categoryId
    ? input.categoryId
    : await createCategory(input.categoryName as string);

  const baseSlug = input.slug ? normalizeSlug(input.slug) : input.name;
  const slug = await generateUniqueSlug(baseSlug, slugExists);

  if (isDatabaseConfigured()) {
    try {
      const rows = await query<Record<string, unknown>>(
        `INSERT INTO products (sku, name, slug, description, brand, category_id, base_price, currency, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, sku, name, slug, description, brand, category_id, base_price, currency, is_active, created_at, updated_at`,
        [
          input.sku,
          input.name,
          slug,
          input.description,
          input.brand ?? null,
          categoryId,
          input.basePrice,
          input.currency ?? "NPR",
          input.isActive ?? true,
        ],
      );
      return mapRow(rows[0]);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      ) {
        throw new Error("A product with that SKU or slug already exists.");
      }
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23503"
      ) {
        throw new Error("The specified category does not exist.");
      }
      throw err;
    }
  }

  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      sku: input.sku,
      name: input.name,
      slug,
      description: input.description,
      brand: input.brand ?? null,
      category_id: categoryId,
      base_price: input.basePrice,
      currency: input.currency ?? "NPR",
      is_active: input.isActive ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export interface UpdateProductInput {
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  brand?: string;
  categoryId?: string;
  basePrice?: string;
  currency?: string;
  isActive?: boolean;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<AdminProductRow> {
  const fields: Record<string, unknown> = {};

  if (input.sku !== undefined) fields.sku = input.sku;
  if (input.name !== undefined) fields.name = input.name;
  if (input.description !== undefined) fields.description = input.description;
  if (input.brand !== undefined) fields.brand = input.brand;
  if (input.categoryId !== undefined) fields.category_id = input.categoryId;
  if (input.basePrice !== undefined) fields.base_price = input.basePrice;
  if (input.currency !== undefined) fields.currency = input.currency;
  if (input.isActive !== undefined) fields.is_active = input.isActive;

  if (input.slug !== undefined) {
    const candidate = normalizeSlug(input.slug);
    const existing = await getProductById(id);
    if (
      existing &&
      existing.slug !== candidate &&
      (await slugExists(candidate))
    ) {
      throw new Error("That slug is already in use by another product.");
    }
    fields.slug = candidate;
  }

  if (Object.keys(fields).length === 0) {
    const existing = await getProductById(id);
    if (!existing) throw new Error("Product not found.");
    return existing;
  }

  if (isDatabaseConfigured()) {
    try {
      const setClauses = Object.keys(fields).map(
        (key, i) => `${key} = $${i + 2}`,
      );
      const rows = await query<Record<string, unknown>>(
        `UPDATE products SET ${setClauses.join(", ")}, updated_at = now()
         WHERE id = $1
         RETURNING id, sku, name, slug, description, brand, category_id, base_price, currency, is_active, created_at, updated_at`,
        [id, ...Object.values(fields)],
      );
      if (!rows[0]) throw new Error("Product not found.");
      return mapRow(rows[0]);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      ) {
        throw new Error("A product with that SKU or slug already exists.");
      }
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23503"
      ) {
        throw new Error("The specified category does not exist.");
      }
      throw err;
    }
  }

  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("products")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export class ProductDependencyError extends Error {
  constructor() {
    super(
      "This product has related images, variants, cart items, order items, or auctions. Archive it instead by setting isActive to false.",
    );
  }
}

/**
 * Hard-deletes a product only when the five operational dependency tables
 * (product_images, product_variants, cart_items, order_items, auctions)
 * have no referencing rows. Otherwise throws ProductDependencyError so the
 * route can return a 409 with archive guidance.
 */
export async function deleteProduct(id: string): Promise<void> {
  if (isDatabaseConfigured()) {
    await withTransaction(async (client) => {
      const dependent = await client.query(
        `SELECT
           EXISTS(SELECT 1 FROM product_images WHERE product_id = $1) AS has_images,
           EXISTS(SELECT 1 FROM product_variants WHERE product_id = $1) AS has_variants,
           EXISTS(SELECT 1 FROM cart_items WHERE product_id = $1) AS has_cart_items,
           EXISTS(SELECT 1 FROM order_items WHERE product_id = $1) AS has_order_items,
           EXISTS(SELECT 1 FROM auctions WHERE product_id = $1) AS has_auctions
        `,
        [id],
      );
      const d = dependent.rows[0];
      if (
        d.has_images ||
        d.has_variants ||
        d.has_cart_items ||
        d.has_order_items ||
        d.has_auctions
      ) {
        throw new ProductDependencyError();
      }

      const result = await client.query(`DELETE FROM products WHERE id = $1`, [
        id,
      ]);
      if (result.rowCount === 0) {
        throw new Error("Product not found.");
      }
    });
    return;
  }

  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const adminClient = supabaseAdmin;

  const checks = await Promise.all(
    [
      "product_images",
      "product_variants",
      "cart_items",
      "order_items",
      "auctions",
    ].map((table) =>
      adminClient
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("product_id", id),
    ),
  );
  if (checks.some((c) => (c.count ?? 0) > 0)) {
    throw new ProductDependencyError();
  }

  const { error } = await adminClient.from("products").delete().eq("id", id);
  if (error) throw error;
}
