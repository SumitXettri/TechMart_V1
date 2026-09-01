import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  try {
    await requireAdmin();
    redirect("/admin/dashboard");
  } catch {
    redirect("/admin/login");
  }
}
