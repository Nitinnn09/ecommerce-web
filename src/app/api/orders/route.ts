import { NextResponse } from "next/server";
import { connectdb } from "@/lib/db";
import Order from "@/lib/model/order";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    await connectdb();

    // ✅ Admin-only: return only orders containing this admin's products
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/adminToken=([^;]+)/);
    const token = match?.[1] || null;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const ordersRaw = await Order.find({ "items.admin": decoded.id }).sort({ createdAt: -1 }); // latest first

    // ✅ hide other admins' items if a mixed order exists
    const orders = ordersRaw.map((o: any) => {
      const items = Array.isArray(o.items) ? o.items.filter((it: any) => String(it?.admin) === String(decoded.id)) : [];
      return { ...o.toObject(), items };
    });

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



export async function POST(req) {
  return NextResponse.json(
    { message: "Use /api/orders/create" },
    { status: 405 }
  );
}
