import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectdb } from "@/lib/db";
import Order from "@/lib/model/order";

export const runtime = "nodejs";

function getToken(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.split(" ")[1];

  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/token=([^;]+)/);
  return match?.[1] || null;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await connectdb();

    const { id } = await ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
    }

    const token = getToken(req);
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = String(decoded?.id || "");
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const order: any = await Order.findById(id);
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    if (String(order.user) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const current = String(order.status || "processing").toLowerCase();
    if (current === "cancelled") {
      return NextResponse.json({ message: "Order already cancelled" }, { status: 400 });
    }
    if (current === "shipped" || current === "delivered") {
      return NextResponse.json({ message: "Order cannot be cancelled now" }, { status: 400 });
    }

    const now = new Date();
    order.status = "cancelled";
    order.cancelledAt = now;
    order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    order.statusHistory.push({ status: "cancelled", at: now });
    await order.save();

    return NextResponse.json(
      {
        message: "Order cancelled",
        order: {
          id: String(order._id),
          orderId: String(order.orderId),
          status: String(order.status),
          cancelledAt: order.cancelledAt || null,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ message: "Server error", error: String(e?.message || e) }, { status: 500 });
  }
}

