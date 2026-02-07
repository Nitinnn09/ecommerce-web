import { NextResponse } from "next/server";
import { connectdb } from "@/lib/db";
import Order from "@/lib/model/order";

export async function GET() {
  try {
    await connectdb();

    const orders = await Order.find().sort({ createdAt: -1 }); // latest first
    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



export async function POST(req) {
  try {
    await connectdb();

    const body = await req.json();
    const order = await Order.create(body);

    return NextResponse.json(
      { message: "Order placed successfully", order },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
