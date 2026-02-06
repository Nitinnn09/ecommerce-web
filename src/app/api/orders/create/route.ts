import { NextResponse } from "next/server";
import { connectdb } from "@/lib/db";
import Order from "@/lib/model/order";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectdb();
    const body = await req.json();

    const {
      orderId,
      userId,
      items,
      shipping,
      paymentMethod,
      shippingMethod,
      subtotal,
      shippingFee,
      discount,
      totalAmount,
    } = body;

    console.log("ORDER_CREATE_BODY:", body);

    // ✅ BASIC VALIDATION
    if (!orderId || !userId) {
      return NextResponse.json({ message: "orderId or userId missing" }, { status: 400 });
    }

    // ✅ IMPORTANT: userId must be ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid userId (must be Mongo ObjectId)" },
        { status: 400 }
      );
    }

    if (!shipping?.firstName || !shipping?.address || !shipping?.phone) {
      return NextResponse.json({ message: "Shipping details missing" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart items missing" }, { status: 400 });
    }

    // ✅ IMPORTANT: productId must be ObjectId
    for (const it of items) {
      if (!it?.productId || !mongoose.Types.ObjectId.isValid(it.productId)) {
        return NextResponse.json(
          { message: `Invalid productId: ${it?.productId}` },
          { status: 400 }
        );
      }
    }

    // ✅ Some schemas require top-level name/address/image
    const fullName = `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim();
    const fullAddress = `${shipping.address || ""}, ${shipping.city || ""}, ${shipping.district || ""} - ${
      shipping.pincode || ""
    }`.trim();

    const firstItem = items[0] || {};
    const image = firstItem.image || "/placeholder.png";
    const productName = firstItem.title || firstItem.name || "Product";

    // ✅ Create doc with ObjectId conversions
    const orderDoc = {
      orderId,
      user: new mongoose.Types.ObjectId(userId),

      name: fullName,
      address: fullAddress,
      image,
      productName,

      items: items.map((it: any) => ({
        product: new mongoose.Types.ObjectId(it.productId),
        qty: Number(it.qty || 1),
        price: Number(it.price || 0),
        image: it.image,
        title: it.title,
      })),

      shipping,

      paymentMethod,
      shippingMethod,

      subtotal: Number(subtotal || 0),
      shippingFee: Number(shippingFee || 0),
      discount: Number(discount || 0),
      totalAmount: Number(totalAmount || 0),

      status: "processing",
    };

    console.log("ORDER_CREATE_DOC:", orderDoc);

    const order = await Order.create(orderDoc);

    console.log("ORDER_SAVED_ID:", order?._id);

    return NextResponse.json({ message: "Order placed successfully ✅", order });
  } catch (e: any) {
    console.error("ORDER CREATE ERROR:", e);
    return NextResponse.json(
      {
        message: e?.message || "Order save failed",
        errors: e?.errors || null,
      },
      { status: 500 }
    );
  }
}
