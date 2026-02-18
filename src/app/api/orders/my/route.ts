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

    const orders: any[] = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("orderId status totalAmount createdAt shipping cancelledAt shippedAt deliveredAt")
      .lean();

    return NextResponse.json(
      {
        orders: orders.map((o) => ({
          id: String(o._id),
          orderId: String(o.orderId),
          status: String(o.status || "processing"),
          totalAmount: Number(o.totalAmount || 0),
          createdAt: o.createdAt || null,
          shipping: o.shipping || null,
          cancelledAt: o.cancelledAt || null,
          shippedAt: o.shippedAt || null,
          deliveredAt: o.deliveredAt || null,
        })),
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ message: "Server error", error: String(e?.message || e) }, { status: 500 });
  }
}

