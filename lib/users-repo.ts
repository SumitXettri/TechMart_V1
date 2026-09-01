import { query, withTransaction } from "./db";
import { hashPassword } from "./auth";
import { AppError } from "./errors";
import { getUserRoles } from "./roles";
import { supabaseAdmin } from "./supabaseAdmin";

export type AdminUser = {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type ListParams = {
  page: number;
  pageSize: number;
  search: string;
  role: string;
  verified: "all" | "verified" | "unverified";
};

const SAFE_COLUMNS = `id, email, phone, full_name, role, email_verified, created_at, updated_at`;

export async function getDashboardStats() {
  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("role, email_verified");

  if (error) throw error;

  const total = users.length;
  const verified = users.filter((user) => user.email_verified).length;

  return {
    total,
    verified,
    unverified: total - verified,
    admins: users.filter((user) => user.role === "ADMIN").length,
    customers: users.filter((user) => user.role === "CUSTOMER").length,
  };
}

export async function listUsers(params: ListParams) {
  const { page, pageSize, search, role, verified } = params;

  try {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      conditions.push(
        `(full_name ilike $${idx} or email ilike $${idx} or phone ilike $${idx})`,
      );
    }
    if (role) {
      values.push(role);
      conditions.push(`role = $${values.length}`);
    }
    if (verified === "verified") conditions.push(`email_verified = true`);
    if (verified === "unverified") conditions.push(`email_verified = false`);

    const whereClause = conditions.length
      ? `where ${conditions.join(" and ")}`
      : "";

    const countResult = await query<{ count: string }>(
      `select count(*)::text as count from public.users ${whereClause}`,
      values,
    );
    const total = Number(countResult.rows[0].count);

    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    values.push(limit, offset);

    const dataResult = await query<AdminUser>(
      `select ${SAFE_COLUMNS}
         from public.users
         ${whereClause}
        order by created_at desc
        limit $${values.length - 1} offset $${values.length}`,
      values,
    );

    return { users: dataResult.rows, total, page, pageSize };
  } catch {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select(
        "id, email, phone, full_name, role, email_verified, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const filteredUsers = (users ?? []).filter((user) => {
      const matchesSearch =
        !search ||
        [user.full_name, user.email, user.phone ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRole = !role || user.role === role;
      const matchesVerified =
        verified === "all" ||
        (verified === "verified" && user.email_verified) ||
        (verified === "unverified" && !user.email_verified);

      return matchesSearch && matchesRole && matchesVerified;
    });

    const total = filteredUsers.length;
    const start = (page - 1) * pageSize;
    const pageUsers = filteredUsers.slice(start, start + pageSize);

    return {
      users: pageUsers as AdminUser[],
      total,
      page,
      pageSize,
    };
  }
}

export async function getUserById(id: string) {
  const result = await query<AdminUser>(
    `select ${SAFE_COLUMNS} from public.users where id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

async function assertValidRole(role: string) {
  const roles = await getUserRoles();
  if (!roles.includes(role)) {
    throw new AppError(
      `Invalid role. Must be one of: ${roles.join(", ")}`,
      400,
    );
  }
}

export async function createUser(input: {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  password?: string;
}) {
  await assertValidRole(input.role);
  const passwordHash = input.password
    ? await hashPassword(input.password)
    : null;

  const result = await query<AdminUser>(
    `insert into public.users (email, phone, password_hash, full_name, role, email_verified)
     values ($1, $2, $3, $4, $5, $6)
     returning ${SAFE_COLUMNS}`,
    [
      input.email,
      input.phone ?? null,
      passwordHash,
      input.fullName,
      input.role,
      input.emailVerified,
    ],
  );
  return result.rows[0];
}

export async function updateUser(
  id: string,
  input: {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    emailVerified?: boolean;
    password?: string;
  },
  actingAdminId: string,
) {
  if (input.role) {
    await assertValidRole(input.role);
    if (id === actingAdminId) {
      const roles = await getUserRoles();
      const adminLabel = roles.find((r) => r.toUpperCase() === "ADMIN");
      if (adminLabel && input.role !== adminLabel) {
        throw new AppError(
          "You cannot change your own role away from admin.",
          403,
        );
      }
    }
  }

  const sets: string[] = [];
  const values: unknown[] = [];

  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (input.fullName !== undefined) push("full_name", input.fullName);
  if (input.email !== undefined) push("email", input.email);
  if (input.phone !== undefined) push("phone", input.phone || null);
  if (input.role !== undefined) push("role", input.role);
  if (input.emailVerified !== undefined)
    push("email_verified", input.emailVerified);
  if (input.password) {
    const hash = await hashPassword(input.password);
    push("password_hash", hash);
  }

  if (sets.length === 0) {
    const existing = await getUserById(id);
    if (!existing) throw new AppError("User not found", 404);
    return existing;
  }

  values.push(id);
  const result = await query<AdminUser>(
    `update public.users set ${sets.join(", ")} where id = $${values.length}
     returning ${SAFE_COLUMNS}`,
    values,
  );

  if (result.rows.length === 0) throw new AppError("User not found", 404);
  return result.rows[0];
}

export async function deleteUser(id: string, actingAdminId: string) {
  if (id === actingAdminId) {
    throw new AppError("You cannot delete your own account.", 403);
  }

  return withTransaction(async (client) => {
    const fkResult = await client.query<{
      table_name: string;
      column_name: string;
    }>(
      `
      select tc.table_name, kcu.column_name
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
      where tc.constraint_type = 'FOREIGN KEY'
        and kcu.referenced_table_name = 'users'
        and kcu.referenced_column_name = 'id'
      `,
    );

    if (fkResult.rows.length > 0) {
      throw new AppError(
        `Cannot delete user while related rows exist in: ${fkResult.rows
          .map((r) => `${r.table_name}.${r.column_name}`)
          .join(", ")}`,
        409,
      );
    }

    const result = await client.query<AdminUser>(
      `delete from public.users where id = $1 returning ${SAFE_COLUMNS}`,
      [id],
    );

    if (result.rows.length === 0) throw new AppError("User not found", 404);
    return result.rows[0];
  });
}
