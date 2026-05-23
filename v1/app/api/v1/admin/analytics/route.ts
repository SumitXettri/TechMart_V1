import { NextResponse } from "next/server";
import { adminAnalytics, adminAlerts, adminOperations, liveAuctionRows } from "../../../../../lib/admin";
import { verifyJwtFromRequest } from "../../../../../lib/serverAuth";

export function GET(request: Request) {
  const payload = verifyJwtFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      metrics: adminAnalytics,
      alerts: adminAlerts,
      liveAuctions: liveAuctionRows,
      operations: adminOperations,
    },
  });
}
