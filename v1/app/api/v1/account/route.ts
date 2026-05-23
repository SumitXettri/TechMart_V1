import { NextResponse } from "next/server";
import { profileSummary, profileStats, savedAddresses } from "../../../../lib/customer";

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      profileSummary,
      profileStats,
      savedAddresses,
    },
  });
}