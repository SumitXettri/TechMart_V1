import { query, withTransaction, isDatabaseConfigured } from "./db";
import { supabaseAdmin } from "./supabaseAdmin";
import { hashPassword } from "./auth";
import { isValidRole } from "./roles";

/**
 * lib/users-repo.ts
 * PostgreSQL is the primary path for list/create/update/delete.
 * listUsers() additionally falls back to Supabase if the PostgreSQL
 * query throws (e.g. DATABASE_URL misconfigured in an environment that
 * still has valid Supabase credentials).
 */

export interface AdminUserRow {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  verified?: "all" | "verified" | "unverified";
  sort?: "created_at" | "full_name" | "email";
  direction?: "asc" | "desc";
}

export interface ListUsersResult {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
}

function mapRow(row: Record<string, unknown>): AdminUserRow {
  return {
    id: String(row.id),
    email: String(row.email),
    phone: (row.phone as string | null) ?? null,
    fullName: String(row.full_name),
    role: String(row.role),
    emailVerified: Boolean(row.email_verified),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function getDashboardStats(): Promise<{
  totalUsers: number;
  adminCount: number;
  verifiedCount: number;
}> {
  if (isDatabaseConfigured()) {
    try {
      const rows = await query<{
        total: string;
        admins: string;
        verified: string;
      }>(
        `SELECT
           COUNT(*)::text AS total,
           COUNT(*) FILTER (WHERE role = 'ADMIN')::text AS admins,
           COUNT(*) FILTER (WHERE email_verified)::text AS verified
         FROM users`,
      );
      const r = rows[0];
      return {
        totalUsers: Number(r?.total ?? 0),
        adminCount: Number(r?.admins ?? 0),
        verifiedCount: Number(r?.verified ?? 0),
      };
    } catch {
      // fall through to Supabase
    }
  }

  if (supabaseAdmin) {
    const { count: total } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true });
    const { count: admins } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "ADMIN");
    const { count: verified } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("email_verified", true);
    return {
      totalUsers: total ?? 0,
      adminCount: admins ?? 0,
      verifiedCount: verified ?? 0,
    };
  }

  throw new Error("No database connection is configured.");
}

export async function listUsers(
  params: ListUsersParams = {},
): Promise<ListUsersResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const sortColumn =
    params.sort === "full_name"
      ? "full_name"
      : params.sort === "email"
        ? "email"
        : "created_at";
  const direction = params.direction === "asc" ? "ASC" : "DESC";

  if (isDatabaseConfigured()) {
    try {
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (params.search) {
        values.push(`%${params.search}%`);
        conditions.push(
          `(full_name ILIKE $${values.length} OR email ILIKE $${values.length} OR phone ILIKE $${values.length})`,
        );
      }
      if (params.role) {
        values.push(params.role);
        conditions.push(`role = $${values.length}`);
      }
      if (params.verified === "verified") {
        conditions.push(`email_verified = true`);
      } else if (params.verified === "unverified") {
        conditions.push(`email_verified = false`);
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const countRows = await query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM users ${whereClause}`,
        values,
      );
      const total = Number(countRows[0]?.count ?? 0);

      values.push(pageSize, offset);
      const rows = await query<Record<string, unknown>>(
        `SELECT id, email, phone, full_name, role, email_verified, created_at, updated_at
         FROM users
         ${whereClause}
         ORDER BY ${sortColumn} ${direction}
         LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values,
      );

      return { users: rows.map(mapRow), total, page, pageSize };
    } catch {
      // fall through to Supabase fallback below
    }
  }

  if (!supabaseAdmin) {
    throw new Error("No database connection is configured.");
  }

  let sbQuery = supabaseAdmin
    .from("users")
    .select(
      "id, email, phone, full_name, role, email_verified, created_at, updated_at",
      { count: "exact" },
    );

  if (params.search) {
    sbQuery = sbQuery.or(
      `full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,phone.ilike.%${params.search}%`,
    );
  }
  if (params.role) {
    sbQuery = sbQuery.eq("role", params.role);
  }
  if (params.verified === "verified") {
    sbQuery = sbQuery.eq("email_verified", true);
  } else if (params.verified === "unverified") {
    sbQuery = sbQuery.eq("email_verified", false);
  }

  const { data, count, error } = await sbQuery
    .order(sortColumn, { ascending: direction === "ASC" })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    users: (data ?? []).map(mapRow),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getUserById(id: string): Promise<AdminUserRow | null> {
  if (isDatabaseConfigured()) {
    try {
      const rows = await query<Record<string, unknown>>(
        `SELECT id, email, phone, full_name, role, email_verified, created_at, updated_at
         FROM users WHERE id = $1`,
        [id],
      );
      return rows[0] ? mapRow(rows[0]) : null;
    } catch {
      // fall through
    }
  }

  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, phone, full_name, role, email_verified, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  emailVerified?: boolean;
  password: string;
}

export async function createUser(
  input: CreateUserInput,
): Promise<AdminUserRow> {
  if (!(await isValidRole(input.role))) {
    throw new Error(`Invalid role: ${input.role}`);
  }
  const passwordHash = await hashPassword(input.password);

  if (isDatabaseConfigured()) {
    try {
      const rows = await query<Record<string, unknown>>(
        `INSERT INTO users (email, phone, password_hash, full_name, role, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, phone, full_name, role, email_verified, created_at, updated_at`,
        [
          input.email,
          input.phone ?? null,
          passwordHash,
          input.fullName,
          input.role,
          input.emailVerified ?? false,
        ],
      );
      return mapRow(rows[0]);
    } catch (err: any) {
      if (err?.code === "23505") {
        throw new Error("A user with that email or phone already exists.");
      }
      throw err;
    }
  }

  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      email: input.email,
      phone: input.phone ?? null,
      password_hash: passwordHash,
      full_name: input.fullName,
      role: input.role,
      email_verified: input.emailVerified ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  emailVerified?: boolean;
  password?: string;
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
  actingAdminId: string,
): Promise<AdminUserRow> {
  // Self-demotion protection: an admin cannot change their own role away
  // from ADMIN.
  if (input.role && id === actingAdminId && input.role !== "ADMIN") {
    throw new Error("You cannot change your own role away from ADMIN.");
  }
  if (input.role && !(await isValidRole(input.role))) {
    throw new Error(`Invalid role: ${input.role}`);
  }

  const fields: Record<string, unknown> = {};
  if (input.fullName !== undefined) fields.full_name = input.fullName;
  if (input.email !== undefined) fields.email = input.email;
  if (input.phone !== undefined) fields.phone = input.phone;
  if (input.role !== undefined) fields.role = input.role;
  if (input.emailVerified !== undefined)
    fields.email_verified = input.emailVerified;
  if (input.password) {
    fields.password_hash = await hashPassword(input.password);
  }

  if (Object.keys(fields).length === 0) {
    const existing = await getUserById(id);
    if (!existing) throw new Error("User not found.");
    return existing;
  }

  if (isDatabaseConfigured()) {
    try {
      const setClauses = Object.keys(fields).map(
        (key, i) => `${key} = $${i + 2}`,
      );
      const rows = await query<Record<string, unknown>>(
        `UPDATE users SET ${setClauses.join(", ")}, updated_at = now()
         WHERE id = $1
         RETURNING id, email, phone, full_name, role, email_verified, created_at, updated_at`,
        [id, ...Object.values(fields)],
      );
      if (!rows[0]) throw new Error("User not found.");
      return mapRow(rows[0]);
    } catch (err: any) {
      if (err?.code === "23505") {
        throw new Error("A user with that email or phone already exists.");
      }
      throw err;
    }
  }

  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { data, error } = await supabaseAdmin
    .from("users")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteUser(
  id: string,
  actingAdminId: string,
): Promise<void> {
  if (id === actingAdminId) {
    throw new Error("You cannot delete your own account.");
  }

  if (isDatabaseConfigured()) {
    await withTransaction(async (client) => {
      // Inspect referencing rows so we can return a clear conflict instead
      // of letting a raw FK violation bubble up.
      const dependent = await client.query(
        `SELECT
           EXISTS(SELECT 1 FROM orders WHERE user_id = $1) AS has_orders,
           EXISTS(SELECT 1 FROM carts WHERE user_id = $1) AS has_carts,
           EXISTS(SELECT 1 FROM reviews WHERE user_id = $1) AS has_reviews,
           EXISTS(SELECT 1 FROM bids WHERE user_id = $1) AS has_bids
         `,
        [id],
      );
      const d = dependent.rows[0];
      if (d.has_orders || d.has_carts || d.has_reviews || d.has_bids) {
        const err: any = new Error(
          "This user has related orders, carts, reviews, or bids and cannot be deleted.",
        );
        err.code = "FK_CONFLICT";
        throw err;
      }

      const result = await client.query(`DELETE FROM users WHERE id = $1`, [
        id,
      ]);
      if (result.rowCount === 0) {
        throw new Error("User not found.");
      }
    });
    return;
  }

  if (!supabaseAdmin) throw new Error("No database connection is configured.");
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) throw error;
}
