/**
 * One-off CLI to bootstrap the first admin account, since a brand-new
 * database has no admins yet and the panel itself requires an admin login.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/create-admin.ts admin@example.com "Full Name" "strongpassword"
 */
import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const [, , email, fullName, password] = process.argv;
  if (!email || !fullName || !password) {
    console.error(
      'Usage: npx tsx scripts/create-admin.ts <email> "<full name>" <password>'
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const enumResult = await pool.query<{ enumlabel: string }>(
    `select e.enumlabel
       from pg_type t
       join pg_enum e on t.oid = e.enumtypid
       join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' and t.typname = 'user_role'
      order by e.enumsortorder`
  );
  const adminLabel = enumResult.rows
    .map((r) => r.enumlabel)
    .find((r) => r.toUpperCase() === "ADMIN");

  if (!adminLabel) {
    console.error("Could not find an ADMIN label on public.user_role.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await pool.query(
    `insert into public.users (email, password_hash, full_name, role, email_verified)
     values ($1, $2, $3, $4, true)
     on conflict (email) do update
       set password_hash = excluded.password_hash,
           role = excluded.role`,
    [email, passwordHash, fullName, adminLabel]
  );

  console.log(`Admin account ready: ${email}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
