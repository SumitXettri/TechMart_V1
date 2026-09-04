import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getRecentDeliveries } from "@/lib/dashboard-repo";

const DELIVERY_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "EXCEPTION",
] as const;

type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

function isDeliveryStatus(value: unknown): value is DeliveryStatus {
  return (
    typeof value === "string" &&
    DELIVERY_STATUSES.includes(value as DeliveryStatus)
  );
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ ok: true, deliveries: await getRecentDeliveries(50) });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? Number(error.status) : 500;
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unable to load deliveries." }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    if (!supabaseAdmin) throw new Error("Server database is not configured.");
    const body = (await request.json()) as {
      orderId?: string;
      carrier?: string;
      trackingNumber?: string;
      estimatedDelivery?: string;
      notes?: string;
    };
    if (!body.orderId?.trim()) {
      return NextResponse.json(
        { ok: false, error: "orderId is required." },
        { status: 400 },
      );
    }

    const { data: shipment, error } = await supabaseAdmin
      .from("delivery_shipments")
      .insert({
        order_id: body.orderId.trim(),
        carrier: body.carrier?.trim() || null,
        tracking_number: body.trackingNumber?.trim() || null,
        estimated_delivery: body.estimatedDelivery || null,
        notes: body.notes?.trim() || null,
      })
      .select("id,order_id,status,carrier,tracking_number,estimated_delivery")
      .single();
    if (error) throw error;

    await supabaseAdmin.from("delivery_events").insert({
      shipment_id: shipment.id,
      status: "PENDING",
      description: "Shipment record created.",
    });
    return NextResponse.json({ ok: true, shipment }, { status: 201 });
  } catch (error) {
    const status =
      error instanceof Error && "status" in error ? Number(error.status) : 500;
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to create shipment.",
      },
      { status },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    if (!supabaseAdmin) throw new Error("Server database is not configured.");
    const body = (await request.json()) as {
      id?: string;
      status?: string;
      location?: string;
      description?: string;
      trackingNumber?: string;
      estimatedDelivery?: string;
    };
    if (!body.id || !isDeliveryStatus(body.status)) {
      return NextResponse.json(
        { ok: false, error: "A shipment id and valid status are required." },
        { status: 400 },
      );
    }

    const timestampFields =
      body.status === "SHIPPED" || body.status === "IN_TRANSIT"
        ? { shipped_at: new Date().toISOString() }
        : body.status === "DELIVERED"
          ? { delivered_at: new Date().toISOString() }
          : {};
    const { data: shipment, error } = await supabaseAdmin
      .from("delivery_shipments")
      .update({
        status: body.status,
        last_location: body.location?.trim() || null,
        tracking_number: body.trackingNumber?.trim() || undefined,
        estimated_delivery: body.estimatedDelivery || undefined,
        ...timestampFields,
      })
      .eq("id", body.id)
      .select(
        "id,order_id,status,carrier,tracking_number,estimated_delivery,last_location",
      )
      .single();
    if (error) throw error;

    const orderStatus =
      body.status === "DELIVERED"
        ? "DELIVERED"
        : body.status === "PENDING"
          ? "PENDING_PAYMENT"
          : body.status === "PROCESSING" || body.status === "EXCEPTION"
            ? "PROCESSING"
            : "SHIPPED";
    await supabaseAdmin
      .from("orders")
      .update({ status: orderStatus })
      .eq("id", shipment.order_id);

    await supabaseAdmin.from("delivery_events").insert({
      shipment_id: body.id,
      status: body.status,
      location: body.location?.trim() || null,
      description:
        body.description?.trim() ||
        `Shipment status changed to ${body.status}.`,
    });
    return NextResponse.json({ ok: true, shipment });
  } catch (error) {
    const status =
      error instanceof Error && "status" in error ? Number(error.status) : 500;
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to update shipment.",
      },
      { status },
    );
  }
}
