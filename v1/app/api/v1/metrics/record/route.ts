import { NextResponse } from "next/server";
import { recordRequest } from "@/lib/observability";

export async function POST(request: Request) {
  try {
    // body may include path/method/user info; currently we only increment global count
    await request.json().catch(() => ({}));
    recordRequest();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "failed to record" }, { status: 500 });
  }
}
