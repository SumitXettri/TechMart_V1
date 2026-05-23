import { NextResponse } from "next/server";
import { recentOrders } from "../../../../../lib/customer";
import { orderTimeline, orderTotals } from "../../../../../lib/orders";

type OrderRouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: OrderRouteParams) {
  const { id } = await params;
  const order = recentOrders.find((item) => item.id.toLowerCase() === id);

  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      order,
      timeline: orderTimeline,
      totals: orderTotals,
    },
  });
}