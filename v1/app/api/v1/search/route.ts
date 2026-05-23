import { NextResponse } from "next/server";
import { searchResults } from "../../../../lib/customer";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() ?? "";

  const data = searchResults.filter((item) =>
    [item.title, item.category, item.note].some((value) => value.toLowerCase().includes(query)),
  );

  return NextResponse.json({
    success: true,
    data,
    meta: { query },
  });
}