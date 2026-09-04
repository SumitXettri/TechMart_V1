import { query, isDatabaseConfigured } from "./db";
import { supabaseAdmin } from "./supabaseAdmin";

type RecentAuctionRow = {
  id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  products: { name: string } | { name: string }[] | null;
};

/**
 * lib/dashboard-repo.ts
 * Read-only metrics for /admin/dashboard. PostgreSQL primary, Supabase
 * fallback, same pattern as the other repos.
 */

export async function getProductStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
}> {
  if (isDatabaseConfigured()) {
    try {
      const rows = await query<{ total: string; active: string }>(
        `SELECT COUNT(*)::text AS total, COUNT(*) FILTER (WHERE is_active)::text AS active FROM products`,
      );
      const total = Number(rows[0]?.total ?? 0);
      const active = Number(rows[0]?.active ?? 0);
      return { total, active, inactive: total - active };
    } catch {
      // fall through
    }
  }
  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { count: total } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true });
  const { count: active } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  return {
    total: total ?? 0,
    active: active ?? 0,
    inactive: (total ?? 0) - (active ?? 0),
  };
}

export async function getAuctionStats(): Promise<{
  total: number;
  live: number;
  scheduled: number;
  ended: number;
}> {
  if (isDatabaseConfigured()) {
    try {
      const rows = await query<{
        total: string;
        live: string;
        scheduled: string;
        ended: string;
      }>(
        `SELECT
           COUNT(*)::text AS total,
           COUNT(*) FILTER (WHERE status = 'LIVE')::text AS live,
           COUNT(*) FILTER (WHERE status = 'SCHEDULED')::text AS scheduled,
           COUNT(*) FILTER (WHERE status = 'ENDED')::text AS ended
         FROM auctions`,
      );
      const r = rows[0];
      return {
        total: Number(r?.total ?? 0),
        live: Number(r?.live ?? 0),
        scheduled: Number(r?.scheduled ?? 0),
        ended: Number(r?.ended ?? 0),
      };
    } catch {
      // fall through
    }
  }
  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const base = supabaseAdmin.from("auctions");
  const [
    { count: total },
    { count: live },
    { count: scheduled },
    { count: ended },
  ] = await Promise.all([
    base.select("id", { count: "exact", head: true }),
    base.select("id", { count: "exact", head: true }).eq("status", "LIVE"),
    base.select("id", { count: "exact", head: true }).eq("status", "SCHEDULED"),
    base.select("id", { count: "exact", head: true }).eq("status", "ENDED"),
  ]);
  return {
    total: total ?? 0,
    live: live ?? 0,
    scheduled: scheduled ?? 0,
    ended: ended ?? 0,
  };
}

export async function getRecentProducts(limit = 5) {
  if (isDatabaseConfigured()) {
    try {
      return await query<Record<string, unknown>>(
        `SELECT id, name, sku, base_price, is_active, created_at
         FROM products ORDER BY created_at DESC LIMIT $1`,
        [limit],
      );
    } catch {
      // fall through
    }
  }
  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, name, sku, base_price, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getRecentAuctions(limit = 5) {
  if (isDatabaseConfigured()) {
    try {
      return await query<Record<string, unknown>>(
        `SELECT a.id, a.status, a.starts_at, a.ends_at, p.name AS product_name
         FROM auctions a
         JOIN products p ON p.id = a.product_id
         ORDER BY a.starts_at DESC LIMIT $1`,
        [limit],
      );
    } catch {
      // fall through
    }
  }
  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("auctions")
    .select("id, status, starts_at, ends_at, products(name)")
    .order("starts_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data as RecentAuctionRow[] | null) ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    product_name: Array.isArray(row.products)
      ? (row.products[0]?.name ?? null)
      : (row.products?.name ?? null),
  }));
}

export async function getMonthlyProductActivity(months = 6) {
  if (isDatabaseConfigured()) {
    try {
      return await query<{ month: string; count: string }>(
        `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
                COUNT(*)::text AS count
         FROM products
         WHERE created_at >= date_trunc('month', now()) - ($1 || ' months')::interval
         GROUP BY 1 ORDER BY 1 ASC`,
        [months],
      );
    } catch {
      // fall through
    }
  }
  // Supabase fallback: pull raw rows and bucket client-side, since PostgREST
  // has no native date_trunc/group-by aggregation endpoint.
  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("created_at")
    .gte("created_at", since.toISOString());
  if (error) throw error;

  const buckets = new Map<string, number>();
  for (const row of data ?? []) {
    const product = row as { created_at: string };
    const d = new Date(product.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count: String(count) }));
}
