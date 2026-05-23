import { NextResponse } from "next/server";
import { recentOrders } from "../../../../lib/customer";

export function GET() {
  return NextResponse.json({
    success: true,
    data: recentOrders,
  });
}