import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
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

export async function GET(req: Request) {
  try {
    await connectdb();

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

    const { searchParams } = new URL(req.url);
    const orderId = String(searchParams.get("orderId") || "").trim();
    if (!orderId) return NextResponse.json({ message: "orderId required" }, { status: 400 });

    const order: any = await Order.findOne({ orderId, user: userId }).lean();
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    return NextResponse.json(
      {
        order: {
          id: String(order._id),
          orderId: String(order.orderId),
          status: String(order.status || "processing"),
          createdAt: order.createdAt || null,
          totalAmount: Number(order.totalAmount || 0),
          paymentMethod: String(order.paymentMethod || ""),
          shippingMethod: String(order.shippingMethod || ""),
          shipping: order.shipping || null,
          items: Array.isArray(order.items)
            ? order.items.map((it: any) => ({
                title: String(it?.title || ""),
                qty: Number(it?.qty || 1),
                price: Number(it?.price || 0),
                image: String(it?.image || ""),
              }))
            : [],
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
