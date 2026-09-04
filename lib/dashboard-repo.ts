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

export type DeliverySummary = {
  pending: number;
  processing: number;
  shipped: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
  exception: number;
};

export type DeliveryRow = {
  id: string;
  order_number: string;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  last_location: string | null;
};

export type ActivityPeriod = {
  period: string;
  products: number;
  users: number;
  orders: number;
  auctions: number;
};

export async function getDeliverySummary(): Promise<DeliverySummary> {
  const empty: DeliverySummary = {
    pending: 0,
    processing: 0,
    shipped: 0,
    inTransit: 0,
    outForDelivery: 0,
    delivered: 0,
    exception: 0,
  };
  if (isDatabaseConfigured()) {
    try {
      const rows = await query<{ status: string; count: string }>(
        `SELECT status::text, COUNT(*)::text AS count
         FROM delivery_shipments GROUP BY status`,
      );
      for (const row of rows) {
        const key = row.status
          .toLowerCase()
          .replace(/_([a-z])/g, (_, letter: string) =>
            letter.toUpperCase(),
          ) as keyof DeliverySummary;
        if (key in empty) empty[key] = Number(row.count);
      }
      return empty;
    } catch {
      // Fall back to Supabase when the SQL database is unavailable or unmigrated.
    }
  }
  if (!supabaseAdmin) return empty;
  const { data } = await supabaseAdmin
    .from("delivery_shipments")
    .select("status");
  for (const row of data ?? []) {
    const key = String(row.status)
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter: string) =>
        letter.toUpperCase(),
      ) as keyof DeliverySummary;
    if (key in empty) empty[key] += 1;
  }
  return empty;
}

export async function getRecentDeliveries(limit = 6): Promise<DeliveryRow[]> {
  if (isDatabaseConfigured()) {
    try {
      return await query<DeliveryRow>(
        `SELECT d.id, o.order_number, d.status::text, d.carrier,
                d.tracking_number, d.estimated_delivery, d.last_location
         FROM delivery_shipments d JOIN orders o ON o.id = d.order_id
         ORDER BY d.updated_at DESC LIMIT $1`,
        [limit],
      );
    } catch {
      // Fall back to Supabase when the SQL database is unavailable or unmigrated.
    }
  }
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("delivery_shipments")
    .select(
      "id,status,carrier,tracking_number,estimated_delivery,last_location,orders(order_number)",
    )
    .order("updated_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => {
    const order = row.orders as
      | { order_number?: string }
      | { order_number?: string }[]
      | null;
    return {
      id: String(row.id),
      order_number: Array.isArray(order)
        ? String(order[0]?.order_number ?? "")
        : String(order?.order_number ?? ""),
      status: String(row.status),
      carrier: row.carrier ? String(row.carrier) : null,
      tracking_number: row.tracking_number ? String(row.tracking_number) : null,
      estimated_delivery: row.estimated_delivery
        ? String(row.estimated_delivery)
        : null,
      last_location: row.last_location ? String(row.last_location) : null,
    };
  });
}

export async function getActivityReport(
  years = 3,
): Promise<{ monthly: ActivityPeriod[]; annual: ActivityPeriod[] }> {
  if (isDatabaseConfigured()) {
    try {
      const [monthly, annual] = await Promise.all([
        query<ActivityPeriod>(
          `WITH periods AS (SELECT to_char(date_trunc('month', now()) - (n || ' months')::interval, 'YYYY-MM') period FROM generate_series(0, 11) n)
           SELECT p.period, COUNT(DISTINCT pr.id)::int products, COUNT(DISTINCT u.id)::int users,
                  COUNT(DISTINCT o.id)::int orders, COUNT(DISTINCT a.id)::int auctions
           FROM periods p LEFT JOIN products pr ON to_char(pr.created_at, 'YYYY-MM') = p.period
           LEFT JOIN users u ON to_char(u.created_at, 'YYYY-MM') = p.period
           LEFT JOIN orders o ON to_char(o.created_at, 'YYYY-MM') = p.period
           LEFT JOIN auctions a ON to_char(a.starts_at, 'YYYY-MM') = p.period
           GROUP BY p.period ORDER BY p.period`,
        ),
        query<ActivityPeriod>(
          `WITH periods AS (SELECT EXTRACT(YEAR FROM now())::int - n AS period FROM generate_series(0, $1 - 1) n)
           SELECT p.period::text, COUNT(DISTINCT pr.id)::int products, COUNT(DISTINCT u.id)::int users,
                  COUNT(DISTINCT o.id)::int orders, COUNT(DISTINCT a.id)::int auctions
           FROM periods p LEFT JOIN products pr ON EXTRACT(YEAR FROM pr.created_at) = p.period
           LEFT JOIN users u ON EXTRACT(YEAR FROM u.created_at) = p.period
           LEFT JOIN orders o ON EXTRACT(YEAR FROM o.created_at) = p.period
           LEFT JOIN auctions a ON EXTRACT(YEAR FROM a.starts_at) = p.period
           GROUP BY p.period ORDER BY p.period`,
          [years],
        ),
      ]);
      return { monthly, annual };
    } catch {
      // Fall back to Supabase bucketing below.
    }
  }
  if (!supabaseAdmin) return { monthly: [], annual: [] };
  const [products, users, orders, auctions] = await Promise.all([
    supabaseAdmin.from("products").select("created_at"),
    supabaseAdmin.from("users").select("created_at"),
    supabaseAdmin.from("orders").select("created_at"),
    supabaseAdmin.from("auctions").select("starts_at"),
  ]);
  const monthlyMap = new Map<string, ActivityPeriod>();
  const annualMap = new Map<string, ActivityPeriod>();
  const now = new Date();
  for (let offset = 0; offset < 12; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(period, {
      period,
      products: 0,
      users: 0,
      orders: 0,
      auctions: 0,
    });
  }
  for (let offset = 0; offset < years; offset += 1) {
    const period = String(now.getFullYear() - offset);
    annualMap.set(period, {
      period,
      products: 0,
      users: 0,
      orders: 0,
      auctions: 0,
    });
  }
  const addRows = (
    rows: unknown[] | null | undefined,
    field: keyof Omit<ActivityPeriod, "period">,
  ) => {
    for (const row of rows ?? []) {
      const value = row as Record<string, unknown>;
      const dateValue = String(value.created_at ?? value.starts_at ?? "");
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) continue;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const year = String(date.getFullYear());
      const monthlyItem = monthlyMap.get(month);
      const annualItem = annualMap.get(year);
      if (monthlyItem) monthlyItem[field] += 1;
      if (annualItem) annualItem[field] += 1;
    }
  };
  addRows(products.data, "products");
  addRows(users.data, "users");
  addRows(orders.data, "orders");
  addRows(auctions.data, "auctions");
  return {
    monthly: Array.from(monthlyMap.values()).sort((a, b) =>
      a.period.localeCompare(b.period),
    ),
    annual: Array.from(annualMap.values()).sort((a, b) =>
      a.period.localeCompare(b.period),
    ),
  };
}
