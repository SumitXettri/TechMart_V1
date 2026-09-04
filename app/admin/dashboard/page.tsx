import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats, listUsers } from "@/lib/users-repo";
import {
  getProductStats,
  getAuctionStats,
  getRecentProducts,
  getRecentAuctions,
  getMonthlyProductActivity,
} from "@/lib/dashboard-repo";

const COLORS = {
  page: "#f7f5ff",
  card: "#ffffff",
  border: "#ebe7f5",

  text: "#171329",
  muted: "#7c748f",

  purple: "#7c3aed",
  purpleDark: "#5b21b6",
  purpleSoft: "#ede9fe",

  green: "#10b981",
  greenSoft: "#ecfdf5",

  amber: "#f59e0b",
  amberSoft: "#fffbeb",

  red: "#ef4444",
  redSoft: "#fef2f2",

  slate: "#64748b",
};

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: "users" | "box" | "gavel" | "activity" | "arrow" | "plus";
  className?: string;
}) {
  if (name === "users") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "box") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="m3 8 9 5 9-5M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "gavel") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m14 4 6 6" />
        <path d="m17 1 6 6" />
        <path d="m3 21 10-10" />
        <path d="m8 6 10 10" />
        <path d="m4 10 10-10 4 4L8 14z" />
        <path d="M2 22h20" />
      </svg>
    );
  }

  if (name === "activity") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
  accent = "purple",
}: {
  label: string;
  value: string | number;
  detail: React.ReactNode;
  icon: "users" | "box" | "gavel" | "activity";
  accent?: "purple" | "green" | "amber";
}) {
  const accentStyles = {
    purple: {
      iconBg: COLORS.purpleSoft,
      iconColor: COLORS.purple,
      glow: "group-hover:shadow-violet-100",
    },
    green: {
      iconBg: COLORS.greenSoft,
      iconColor: COLORS.green,
      glow: "group-hover:shadow-emerald-100",
    },
    amber: {
      iconBg: COLORS.amberSoft,
      iconColor: COLORS.amber,
      glow: "group-hover:shadow-amber-100",
    },
  };

  const style = accentStyles[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${style.glow}`}
      style={{ borderColor: COLORS.border }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: COLORS.muted }}>
            {label}
          </p>

          <p
            className="mt-3 text-3xl font-bold tracking-tight"
            style={{ color: COLORS.text }}
          >
            {value}
          </p>
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            backgroundColor: style.iconBg,
            color: style.iconColor,
          }}
        >
          <Icon name={icon} />
        </div>
      </div>

      <div
        className="mt-4 border-t pt-3 text-xs"
        style={{ borderColor: COLORS.border, color: COLORS.muted }}
      >
        {detail}
      </div>

      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl transition group-hover:opacity-50"
        style={{ backgroundColor: style.iconColor }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let color = COLORS.slate;
  let background = "#f1f5f9";

  if (normalized === "live" || normalized === "active") {
    color = COLORS.green;
    background = COLORS.greenSoft;
  } else if (normalized === "scheduled") {
    color = COLORS.amber;
    background = COLORS.amberSoft;
  } else if (normalized === "ended" || normalized === "inactive") {
    color = COLORS.slate;
    background = "#f1f5f9";
  } else {
    color = COLORS.red;
    background = COLORS.redSoft;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
      style={{ color, backgroundColor: background }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {status}
    </span>
  );
}

function MonthlyActivity({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div className="mt-6">
      <div className="flex h-56 items-end gap-3">
        {data.map((item) => {
          const percentage = Math.max(8, Math.round((item.count / max) * 100));

          return (
            <div
              key={item.month}
              className="group flex h-full flex-1 flex-col justify-end"
            >
              <div className="relative flex flex-1 items-end justify-center">
                <div
                  className="absolute bottom-0 w-full rounded-t-xl bg-violet-100 transition-all duration-300 group-hover:bg-violet-200"
                  style={{
                    height: `${percentage}%`,
                  }}
                />

                <div
                  className="relative z-10 w-full max-w-9 rounded-t-xl transition-all duration-300 group-hover:from-violet-500 group-hover:to-indigo-600"
                  style={{
                    height: `${percentage}%`,
                    background: "linear-gradient(to top, #7c3aed, #8b5cf6)",
                  }}
                />

                <div className="absolute bottom-full mb-2 hidden rounded-lg bg-slate-900 px-2 py-1 text-[11px] text-white group-hover:block">
                  {item.count} products
                </div>
              </div>

              <span
                className="mt-3 text-center text-[11px] font-medium"
                style={{ color: COLORS.muted }}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h2
        className="text-lg font-bold tracking-tight"
        style={{ color: COLORS.text }}
      >
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const [
    userStats,
    productStats,
    auctionStats,
    recentUsers,
    recentProducts,
    recentAuctions,
    monthly,
  ] = await Promise.all([
    getDashboardStats(),
    getProductStats(),
    getAuctionStats(),
    listUsers({
      page: 1,
      pageSize: 5,
      sort: "created_at",
      direction: "desc",
    }),
    getRecentProducts(5),
    getRecentAuctions(5),
    getMonthlyProductActivity(6),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen" style={{ color: COLORS.text }}>
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS.green }}
            />

            <span
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: COLORS.muted }}
            >
              System operational
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Admin Dashboard
          </h1>

          <p
            className="mt-2 text-sm sm:text-base"
            style={{ color: COLORS.muted }}
          >
            Marketplace operations at a glance.
          </p>
        </div>

        <div
          className="rounded-xl border bg-white px-4 py-3 shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <p className="text-xs" style={{ color: COLORS.muted }}>
            Today
          </p>

          <p className="mt-0.5 text-sm font-semibold">{today}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={userStats.totalUsers.toLocaleString()}
          icon="users"
          accent="purple"
          detail={
            <>
              <span className="font-semibold text-violet-600">
                {userStats.verifiedCount}
              </span>{" "}
              verified ·{" "}
              <span className="font-semibold">{userStats.adminCount}</span>{" "}
              admins
            </>
          }
        />

        <StatCard
          label="Products"
          value={productStats.total.toLocaleString()}
          icon="box"
          accent="purple"
          detail={
            <>
              <span className="font-semibold text-emerald-600">
                {productStats.active}
              </span>{" "}
              active · {productStats.inactive} inactive
            </>
          }
        />

        <StatCard
          label="Auctions"
          value={auctionStats.total.toLocaleString()}
          icon="gavel"
          accent="amber"
          detail={
            <>
              <span className="font-semibold text-emerald-600">
                {auctionStats.live}
              </span>{" "}
              live · {auctionStats.scheduled} scheduled
            </>
          }
        />

        <StatCard
          label="Live Auctions"
          value={auctionStats.live.toLocaleString()}
          icon="activity"
          accent="green"
          detail={
            <>
              <span className="font-semibold text-amber-600">
                {auctionStats.scheduled}
              </span>{" "}
              scheduled · {auctionStats.ended} ended
            </>
          }
        />
      </div>

      {/* Analytics + auction status */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Activity chart */}
        <section
          className="rounded-2xl border bg-white p-6 shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <div className="flex items-start justify-between">
            <div>
              <SectionHeader
                title="Product activity"
                subtitle="Monthly product listing activity"
              />
            </div>

            <div
              className="rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: COLORS.purpleSoft,
                color: COLORS.purple,
              }}
            >
              Last 6 months
            </div>
          </div>

          <MonthlyActivity
            data={monthly.map((item: any) => ({
              month: item.month,
              count: item.count,
            }))}
          />
        </section>

        {/* Auction overview */}
        <section
          className="rounded-2xl border bg-white p-6 shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <SectionHeader
            title="Auction overview"
            subtitle="Current marketplace status"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                  <Icon name="activity" className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">Live</p>
                  <p className="text-xs text-slate-500">Currently active</p>
                </div>
              </div>

              <span className="text-xl font-bold text-emerald-600">
                {auctionStats.live}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Scheduled
                </p>
                <p className="text-xs text-slate-500">Upcoming auctions</p>
              </div>

              <span className="text-xl font-bold text-amber-600">
                {auctionStats.scheduled}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Ended</p>
                <p className="text-xs text-slate-500">Completed auctions</p>
              </div>

              <span className="text-xl font-bold text-slate-500">
                {auctionStats.ended}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Recent data */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Recent users */}
        <section
          className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="flex items-center justify-between border-b px-6 py-5"
            style={{ borderColor: COLORS.border }}
          >
            <div>
              <h2 className="font-bold">Recent users</h2>
              <p className="mt-1 text-xs" style={{ color: COLORS.muted }}>
                Latest registered accounts
              </p>
            </div>

            <a
              href="/admin/users"
              className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              View all
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </a>
          </div>

          <div>
            {recentUsers.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-violet-50/40"
                style={{ borderColor: COLORS.border }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                    {user.fullName
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {user.fullName}
                    </p>

                    <p
                      className="truncate text-xs"
                      style={{ color: COLORS.muted }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent products */}
        <section
          className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="flex items-center justify-between border-b px-6 py-5"
            style={{ borderColor: COLORS.border }}
          >
            <div>
              <h2 className="font-bold">Recent products</h2>
              <p className="mt-1 text-xs" style={{ color: COLORS.muted }}>
                Latest marketplace listings
              </p>
            </div>

            <a
              href="/admin/products"
              className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              View all
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </a>
          </div>

          <div>
            {recentProducts.map((product: any) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-violet-50/40"
                style={{ borderColor: COLORS.border }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Icon name="box" className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {product.name}
                    </p>

                    <p
                      className="truncate text-xs"
                      style={{ color: COLORS.muted }}
                    >
                      {product.sku}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 text-sm font-bold">
                  {typeof product.base_price === "number"
                    ? product.base_price.toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                      })
                    : product.base_price}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent auctions */}
      <section
        className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-5"
          style={{ borderColor: COLORS.border }}
        >
          <div>
            <h2 className="font-bold">Recent auctions</h2>
            <p className="mt-1 text-xs" style={{ color: COLORS.muted }}>
              Latest auction activity
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
            New auction
          </button>
        </div>

        <div className="grid md:grid-cols-2">
          {recentAuctions.map((auction: any) => (
            <div
              key={auction.id}
              className="flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0 hover:bg-violet-50/40 md:even:border-l"
              style={{ borderColor: COLORS.border }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {auction.product_name}
                </p>

                <p className="mt-1 text-xs" style={{ color: COLORS.muted }}>
                  Auction marketplace
                </p>
              </div>

              <StatusBadge status={auction.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
