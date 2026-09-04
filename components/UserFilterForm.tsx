import Link from "next/link";

type UserFilterFormProps = {
  search: string;
  sort: string;
  direction: string;
  role: string;
  verified: string;
};

export function UserFilterForm({
  search,
  sort,
  direction,
  role,
  verified,
}: UserFilterFormProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Find a user</p>
          <p className="mt-1 text-sm text-slate-500">
            Search by identity details, then refine the account list.
          </p>
        </div>
        {search ? (
          <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:inline-flex">
            Searching for &quot;{search}&quot;
          </span>
        ) : null}
      </div>

      <form
        method="get"
        action="/admin/users"
        className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr_0.9fr_1fr_0.8fr_auto]"
      >
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Search
          </span>
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name, email, or phone"
            aria-label="Search users by name, email, or phone"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 shadow-inner shadow-slate-200/30 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Sort by
          </span>
          <select
            name="sort"
            defaultValue={sort}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
          >
            <option value="created_at">Joined date</option>
            <option value="full_name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Direction
          </span>
          <select
            name="direction"
            defaultValue={direction}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
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
            className="inline-flex h-11.5 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            Search
          </button>
          <Link
            href="/admin/users"
            className="inline-flex h-11.5 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}
