import { NextResponse } from "next/server";
import { notifications } from "../../../../lib/notifications";

export function GET() {
  return NextResponse.json({ success: true, data: notifications });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  // For demo: echo back payload and pretend to mark as read
  return NextResponse.json({ success: true, data: { updated: body } });
}
