import { NextResponse } from "next/server";
import { bulkImportTemplate } from "../../../../../lib/admin";
import { verifyJwtFromRequest } from "../../../../../lib/serverAuth";

export function GET() {
  // allow admins to fetch the template
  return NextResponse.json({
    success: true,
    data: {
      template: bulkImportTemplate,
      delimiter: "comma",
      requiredColumns: ["sku", "name", "category", "price", "stock"],
    },
  });
}

export async function POST(request: Request) {
  const payload = verifyJwtFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    data: {
      message: "Bulk import stub accepted for demo workspace flow.",
      payload: body,
    },
  });
}