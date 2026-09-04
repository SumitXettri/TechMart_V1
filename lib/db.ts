import { Pool, type QueryResultRow, type PoolClient } from "pg";

/**
 * lib/db.ts
 * PostgreSQL access layer. Exposes a pooled `query()` helper and a
 * `withTransaction()` helper. This is the "primary" data path for
 * users-repo, products-repo, and dashboard-repo, with lib/supabaseAdmin.ts
 * used as a fallback when a query here fails or the connection is invalid.
 */

const PLACEHOLDER_MARKERS = ["[PROJECT_REF]", "[PASSWORD]", "[POOLER_HOST]"];

function resolveConnectionString(): string | null {
  const candidate =
    process.env.NEXT_PUBLIC_DATABASE_URL || process.env.DATABASE_URL || "";

  if (!candidate) return null;
  if (!/^postgres(ql)?:\/\//.test(candidate)) return null;
  if (PLACEHOLDER_MARKERS.some((marker) => candidate.includes(marker))) {
    return null;
  }
  return candidate;
}

const connectionString = resolveConnectionString();

// Lazily-created singleton pool. `pool` is null when no valid connection
// string is configured; callers should treat that as "PostgreSQL path
// unavailable" and fall back to Supabase.
export const pool: Pool | null = connectionString
  ? new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
    })
  : null;

export function isDatabaseConfigured(): boolean {
  return pool !== null;
}

/**
 * Run a parameterized query against the pool.
 * Always use $1, $2, ... placeholders — never interpolate user input.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!pool) {
    throw new Error("DATABASE_URL is not configured or is invalid.");
  }
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

/**
 * Run a callback inside a transaction. Commits on success, rolls back
 * and rethrows on failure, and always releases the client.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  if (!pool) {
    throw new Error("DATABASE_URL is not configured or is invalid.");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
