import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loginSchema } from "@/lib/validation";

const GENERIC_ERROR = "Invalid email or password.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const { email, password } = parsed.data;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin login is temporarily unavailable." },
        { status: 503 },
      );
    }
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, password_hash, role")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "This account does not have admin access." },
        { status: 403 },
      );
    }

    await createSession({ sub: user.id, email: user.email, role: user.role });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin login database error:", error);
    return NextResponse.json(
      {
        error:
          "Admin login is temporarily unavailable. Check the database configuration.",
      },
      { status: 503 },
    );
  }
}
