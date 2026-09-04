import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/users-repo";
import UsersTableClient from "@/components/UsersTableClient";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    verified?: string;
    sort?: string;
    direction?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const sp = await searchParams;

  const result = await listUsers({
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 20,
    search: sp.search,
    role: sp.role,
    verified: sp.verified as any,
    sort: sp.sort as any,
    direction: sp.direction as any,
  });

  return <UsersTableClient initialResult={result} />;
}
