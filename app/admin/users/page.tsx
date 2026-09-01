import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/users-repo";
import { UserManagementTable } from "@/components/UserManagementTable";

const PAGE_SIZE = 10;

function buildUrl(
  params: Record<string, string | number | undefined>,
  overrides: Record<string, string | number | undefined> = {},
) {
  const searchParams = new URLSearchParams();

  Object.entries({ ...params, ...overrides }).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{
        page?: string;
        search?: string;
        role?: string;
        verified?: string;
      }>
    | {
        page?: string;
        search?: string;
        role?: string;
        verified?: string;
      };
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const resolvedParams =
    typeof searchParams === "object" &&
    searchParams !== null &&
    "then" in searchParams
      ? await searchParams
      : (searchParams ?? {});

  const page = Math.max(1, Number(resolvedParams.page ?? "1") || 1);
  const search =
    typeof resolvedParams.search === "string"
      ? resolvedParams.search.trim()
      : "";
  const role =
    typeof resolvedParams.role === "string"
      ? resolvedParams.role.toUpperCase()
      : "";
  const verified =
    resolvedParams.verified === "verified" ||
    resolvedParams.verified === "unverified"
      ? resolvedParams.verified
      : "all";

  const result = await listUsers({
    page,
    pageSize: PAGE_SIZE,
    search,
    role,
    verified,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Manage accounts</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Users
          </h1>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
          {result.total} total users
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <form
          method="get"
          action="/admin/users"
          className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr_0.9fr_auto]"
        >
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Search
            </span>
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name, email, or phone"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Role
            </span>
            <select
              name="role"
              defaultValue={role}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="CUSTOMER">Customer</option>
              <option value="SELLER">Seller</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Status
            </span>
            <select
              name="verified"
              defaultValue={verified}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="all">All users</option>
              <option value="verified">Verified only</option>
              <option value="unverified">Unverified only</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-[46px] items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Apply
            </button>
            <Link
              href="/admin/users"
              className="inline-flex h-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <UserManagementTable
        users={result.users}
        total={result.total}
        page={page}
        totalPages={totalPages}
      />

      {result.total > 0 ? (
        <nav className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/60">
          <div className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={buildUrl(
                { page: page - 1, search, role, verified },
                page <= 1 ? { page: 1 } : {},
              )}
              className={
                page <= 1
                  ? "pointer-events-none rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              }
            >
              Previous
            </Link>
            <Link
              href={buildUrl(
                { page: page + 1, search, role, verified },
                page >= totalPages ? { page: totalPages } : {},
              )}
              className={
                page >= totalPages
                  ? "pointer-events-none rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              }
            >
              Next
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
