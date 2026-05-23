import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    data: {
      verified: true,
      code: typeof body.code === "string" ? body.code : "000000",
      message: "Two-factor verification stub accepted.",
    },
  });
}