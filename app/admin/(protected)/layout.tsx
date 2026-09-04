import AdminHeader from "@/components/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin().catch(() => redirect("/admin/login"));

  return (
    <div className="min-h-screen bg-[#f6f8f5] text-slate-900">
      <AdminHeader adminEmail={admin.email} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
