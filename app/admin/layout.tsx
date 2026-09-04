import AdminHeader from "@/components/AdminHeader";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;
  admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f7f5ff] text-slate-900">
      <AdminHeader adminEmail={admin.email} />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
