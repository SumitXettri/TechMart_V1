import { NextResponse } from "next/server";
import { getMetrics, recordRequest, recordError } from "@/lib/observability";

export function GET() {
  try {
    recordRequest();
    const metrics = getMetrics();
    return NextResponse.json({ success: true, data: metrics });
  } catch {
    recordError();
    return NextResponse.json({ success: false, message: "Failed to collect metrics" }, { status: 500 });
  }
}
