import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Admin API is available.",
  });
}

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "Admin API POST handler is available.",
  });
}
