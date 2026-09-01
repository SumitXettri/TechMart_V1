import { Pool, PoolClient, QueryResultRow } from "pg";

const connectionString = (
  process.env.NEXT_PUBLIC_DATABASE_URL ||
  process.env.DATABASE_URL ||
  ""
).trim();

const hasPlaceholderValues = /\[(?:PROJECT_REF|PASSWORD|POOLER_HOST)\]/i.test(
  connectionString,
);
const isValidConnectionString =
  connectionString.length > 0 &&
  !hasPlaceholderValues &&
  /^postgres(?:ql)?:\/\//.test(connectionString);

export const pool = isValidConnectionString
  ? new Pool({
      connectionString,
      max: 5,
    })
  : null;

function ensurePool() {
  if (!pool) {
    const message = connectionString
      ? "The configured DATABASE_URL is invalid or still contains placeholder values. Replace it with a valid PostgreSQL connection string before using database queries."
      : "DATABASE_URL is not configured. Set it in your environment before using database queries.";

    throw new Error(message);
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
