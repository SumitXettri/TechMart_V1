import { query, isDatabaseConfigured } from "./db";

/**
 * lib/roles.ts
 * Reads the `user_role` Postgres enum directly so role validation stays
 * in sync with the database even if application code drifts.
 */

const FALLBACK_ROLES = ["CUSTOMER", "ADMIN", "SUPPORT"] as const;

export async function getUserRoles(): Promise<string[]> {
  if (!isDatabaseConfigured()) {
    return [...FALLBACK_ROLES];
  }

  try {
    const rows = await query<{ value: string }>(
      `SELECT unnest(enum_range(NULL::user_role))::text AS value`,
    );
    if (rows.length === 0) return [...FALLBACK_ROLES];
    return rows.map((r) => r.value);
  } catch {
    // If the enum introspection query fails for any reason, don't block
    // admin operations — fall back to the known application-level roles.
    return [...FALLBACK_ROLES];
  }
}

export async function isValidRole(role: string): Promise<boolean> {
  const roles = await getUserRoles();
  return roles.includes(role);
}
