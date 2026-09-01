import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/users-repo";
import { StatsCard } from "@/components/StatsCard";

const overviewMetrics = [
  { label: "Total Users", accent: "blue", trend: "Live" },
  { label: "Verified Users", accent: "green", trend: "On track" },
  { label: "Unverified Users", accent: "amber", trend: "Needs review" },
  { label: "Customers", accent: "default", trend: "Active" },
  { label: "Admins", accent: "purple", trend: "Secure" },
] as const;

const revenueBars = [
  { label: "Jan", value: "28%" },
  { label: "Feb", value: "42%" },
  { label: "Mar", value: "35%" },
  { label: "Apr", value: "58%" },
  { label: "May", value: "74%" },
  { label: "Jun", value: "82%" },
];

const recentUsers = [
  {
    name: "Ariana Woods",
    email: "ariana@techmart.com",
    role: "Customer",
    status: "Verified",
  },
  {
    name: "Daniel Shah",
    email: "daniel@techmart.com",
    role: "Seller",
    status: "Pending",
  },
  {
    name: "Mira Patel",
    email: "mira@techmart.com",
    role: "Customer",
    status: "Verified",
  },
  {
    name: "Samir Khan",
    email: "samir@techmart.com",
    role: "Admin",
    status: "Verified",
  },
];

const activityFeed = [
  {
    title: "New auction published",
    detail: "Galaxy Pro Laptop went live 2 hours ago",
    tone: "text-emerald-600",
  },
  {
    title: "Customer account created",
    detail: "3 new signups were added this morning",
    tone: "text-blue-600",
  },
  {
    title: "Payment review pending",
    detail: "2 transactions require inspection",
    tone: "text-amber-600",
  },
  {
    title: "Admin permissions updated",
    detail: "Support team role access refreshed",
    tone: "text-violet-600",
  },
];

export default async function DashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const stats = await getDashboardStats();

  const metricValues = {
    total: stats.total,
    verified: stats.verified,
    unverified: stats.unverified,
    customers: stats.customers,
    admins: stats.admins,
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg shadow-slate-200/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Admin Overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Live data synced 2 mins ago
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {overviewMetrics.map((metric, index) => (
          <StatsCard
            key={metric.label}
            label={metric.label}
            value={
              metricValues[
                index === 0
                  ? "total"
                  : index === 1
                    ? "verified"
                    : index === 2
                      ? "unverified"
                      : index === 3
                        ? "customers"
                        : "admins"
              ]
            }
            accent={metric.accent}
            trend={metric.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Market activity
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Performance overview
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              +18.4% this month
            </span>
          </div>

          <div className="flex h-56 items-end gap-4 rounded-2xl bg-slate-50 p-4">
            {revenueBars.map((bar) => (
              <div
                key={bar.label}
                className="flex flex-1 flex-col items-center gap-3"
              >
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-blue-600 to-cyan-400 shadow-sm shadow-blue-200"
                    style={{ height: bar.value }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-500">Quick actions</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Workspace shortcuts
          </h2>

          <div className="mt-6 space-y-3">
            {[
              "Review new listings",
              "Approve users",
              "Create auction",
              "Export report",
            ].map((action) => (
              <button
                key={action}
                type="button"
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <span>{action}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Community</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Recent signups
              </h2>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              View all
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                {recentUsers.map((user) => (
                  <tr key={user.email} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          user.status === "Verified"
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-500">Updates</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Activity feed
          </h2>

          <div className="mt-6 space-y-4">
            {activityFeed.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone}`}
                  />
                  <div>
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
