import { query } from "./db";

let cachedRoles: string[] | null = null;

export async function getUserRoles(): Promise<string[]> {
  if (cachedRoles) return cachedRoles;

  const result = await query<{ enumlabel: string }>(`
    select e.enumlabel as enumlabel
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'user_role'
    order by e.enumsortorder
  `);

  const roles = result.rows.map((row) => row.enumlabel);

  if (!roles.length) {
    throw new Error(
      "Could not find the public.user_role enum in the database. Verify the enum exists before using role-based features.",
    );
  }

  cachedRoles = roles;
  return roles;
}
