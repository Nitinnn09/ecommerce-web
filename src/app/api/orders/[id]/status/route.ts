import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectdb } from "@/lib/db";
import Order from "@/lib/model/order";

export const runtime = "nodejs";

const allowed = new Set(["processing", "shipped", "delivered", "cancelled"]);

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await connectdb();

    const { id } = await ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
    }

    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/adminToken=([^;]+)/);
    const token = match?.[1] || null;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminId = String(decoded?.id || "");
    if (!adminId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as any;
    const nextStatus = String(body?.status || "").toLowerCase();
    if (!allowed.has(nextStatus)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const order: any = await Order.findOne({ _id: id, "items.admin": adminId });
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    const current = String(order.status || "processing").toLowerCase();

    if (current === "cancelled") {
      return NextResponse.json({ message: "Order already cancelled" }, { status: 400 });
    }

    if (nextStatus === "shipped" && current !== "processing") {
      return NextResponse.json({ message: "Only processing orders can be shipped" }, { status: 400 });
    }
    if (nextStatus === "delivered" && current !== "shipped") {
      return NextResponse.json({ message: "Only shipped orders can be delivered" }, { status: 400 });
    }
    if (nextStatus === "processing" && current !== "processing") {
      return NextResponse.json({ message: "Cannot revert status" }, { status: 400 });
    }
    if (nextStatus === "cancelled") {
      return NextResponse.json({ message: "Admin cannot cancel from here" }, { status: 400 });
    }

    order.status = nextStatus;
    const now = new Date();
    if (nextStatus === "shipped") order.shippedAt = now;
    if (nextStatus === "delivered") order.deliveredAt = now;
    order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    order.statusHistory.push({ status: nextStatus, at: now });

    await order.save();

    return NextResponse.json(
      {
        message: "Status updated",
        order: {
          id: String(order._id),
          orderId: String(order.orderId),
          status: String(order.status),
          shippedAt: order.shippedAt || null,
          deliveredAt: order.deliveredAt || null,
          cancelledAt: order.cancelledAt || null,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ message: "Server error", error: String(e?.message || e) }, { status: 500 });
  }
}

