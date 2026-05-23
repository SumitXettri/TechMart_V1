import { NextResponse } from "next/server";
import { authUser } from "../../../../../lib/auth";

export function GET() {
  return NextResponse.json({
    success: true,
    data: authUser,
  });
}