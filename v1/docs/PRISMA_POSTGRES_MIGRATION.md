# Prisma Postgres Migration Notes

This document describes a safe, minimal path to migrate the local SQLite development DB to PostgreSQL for production readiness.

Prerequisites
- Install PostgreSQL (local or Docker). Example with Docker:

```bash
docker run --name techmart-pg -e POSTGRES_USER=techmart -e POSTGRES_PASSWORD=techmart -e POSTGRES_DB=techmart -p 5432:5432 -d postgres:15
```

- Set `DATABASE_URL` environment variable (example):

```
DATABASE_URL=postgresql://techmart:techmart@localhost:5432/techmart
```

Add the Postgres Prisma schema
- A Postgres-ready schema file exists at `prisma/schema.postgres.prisma`.
- To generate the Prisma Client for Postgres:

```bash
npx prisma generate --schema=prisma/schema.postgres.prisma
```

Create the initial migration

```bash
npx prisma migrate dev --name init --schema=prisma/schema.postgres.prisma
```

Options for migrating data from SQLite -> Postgres
- Small datasets: export CSV from SQLite and import into Postgres with `psql` or `COPY`.
- Larger or production datasets: use `pgloader` to convert in-place.
- Alternative: write a one-off Node script that reads existing SQLite rows via the SQLite Prisma schema and writes to Postgres using the Postgres Prisma Client.

Quick example (one-off Node script outline):

1. Keep existing `prisma/schema.prisma` (SQLite) and run `npx prisma generate` to get a client targeting SQLite.
2. Set `DATABASE_URL` to Postgres and generate the Postgres client from `prisma/schema.postgres.prisma`.
3. Run a Node script that loads rows from SQLite client and upserts them into the Postgres client. Be careful with relations and IDs — prefer upsert by natural keys (slug, sku) rather than preserving autoincremented IDs.

Post-deployment notes
- Update environment variables in production with the Postgres `DATABASE_URL`.
- Ensure proper backups and monitoring for the Postgres instance.
- Re-enable Postgres-specific features (JSONB indexing, full-text search, partitioning) as needed.

If you want, I can scaffold a data-migration script that reads from local SQLite `prisma/schema.prisma` and writes to Postgres using `prisma/schema.postgres.prisma` clients.
