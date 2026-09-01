import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;

  try {
    admin = await requireAdmin();
  } catch {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-0 flex-1 flex-col">
          <Header adminEmail={admin.email} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
