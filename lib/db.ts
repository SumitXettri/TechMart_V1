import { Pool, PoolClient, QueryResultRow } from "pg";

const connectionString =
  process.env.NEXT_PUBLIC_DATABASE_URL || process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      max: 5,
    })
  : null;

function ensurePool() {
  if (!pool) {
    throw new Error(
      "DATABASE_URL is not configured. Set it in your environment before using database queries.",
    );
  }

  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return ensurePool().query<T>(text, params ?? []);
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await ensurePool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
