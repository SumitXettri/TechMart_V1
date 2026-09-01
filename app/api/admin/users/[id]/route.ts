import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateUser, deleteUser, getUserById } from "@/lib/users-repo";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  role: z.enum(["ADMIN", "CUSTOMER", "SUPPORT"]).optional(),
  emailVerified: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    const adminUser = await getUserById(id);
    if (!adminUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sessionUser = await requireAdmin();
    const updated = await updateUser(id, parsed.data, sessionUser.sub);

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const sessionUser = await requireAdmin();
    const deleted = await deleteUser(id, sessionUser.sub);

    return NextResponse.json({ ok: true, user: deleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
