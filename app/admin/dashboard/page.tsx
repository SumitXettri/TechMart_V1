import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/users-repo";
import { StatsCard } from "@/components/StatsCard";

export default async function DashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">
        Live figures from the{" "}
        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
          public.users
        </code>{" "}
        table.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard label="Total Users" value={stats.total} accent="blue" />
        <StatsCard
          label="Verified Users"
          value={stats.verified}
          accent="green"
        />
        <StatsCard
          label="Unverified Users"
          value={stats.unverified}
          accent="amber"
        />
        <StatsCard label="Customers" value={stats.customers} />
        <StatsCard label="Admins" value={stats.admins} accent="purple" />
      </div>
    </div>
  );
}
