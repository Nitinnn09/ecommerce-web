import { NextResponse } from "next/server";
import { connectdb } from "@/lib/db";
import Order from "@/lib/model/order";
import Product from "@/lib/model/product";
import Admin from "@/lib/model/admin";
import mongoose from "mongoose";
import { isSmtpConfigured, sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

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

    if (!orderId || !userId) {
      return NextResponse.json({ message: "orderId or userId missing" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid userId (must be Mongo ObjectId)" }, { status: 400 });
    }

    if (
      !shipping?.email ||
      !shipping?.phone ||
      !shipping?.firstName ||
      !shipping?.lastName ||
      !shipping?.city ||
      !shipping?.district ||
      !shipping?.address ||
      !shipping?.pincode
    ) {
      return NextResponse.json({ message: "Shipping details missing" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart items missing" }, { status: 400 });
    }

    for (const it of items) {
      if (!it?.productId || !mongoose.Types.ObjectId.isValid(it.productId)) {
        return NextResponse.json({ message: `Invalid productId: ${it?.productId}` }, { status: 400 });
      }
    }

    const ids = items.map((it: any) => String(it.productId));
    const products = await Product.find({ _id: { $in: ids } }).select("_id adminId");
    const adminByProductId = new Map<string, any>();
    products.forEach((p: any) => adminByProductId.set(String(p._id), p.adminId || null));

    const fullName = `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim();
    const fullAddress = `${shipping.address || ""}, ${shipping.city || ""}, ${shipping.district || ""} - ${
      shipping.pincode || ""
    }`.trim();

    const firstItem = items[0] || {};
    const image = firstItem.image || "/placeholder.png";
    const productName = firstItem.title || firstItem.name || "Product";

    const now = new Date();

    const orderDoc: any = {
      orderId,
      user: new mongoose.Types.ObjectId(userId),

      name: fullName,
      address: fullAddress,
      image,
      productName,

      items: items.map((it: any) => ({
        product: new mongoose.Types.ObjectId(it.productId),
        admin: adminByProductId.get(String(it.productId)) || null,
        qty: Number(it.qty || 1),
        price: Number(it.price || 0),
        image: String(it.image || ""),
        title: String(it.title || ""),
      })),

      shipping,

      paymentMethod: String(paymentMethod || "cod"),
      shippingMethod: String(shippingMethod || "regular"),

      subtotal: Number(subtotal || 0),
      shippingFee: Number(shippingFee || 0),
      discount: Number(discount || 0),
      totalAmount: Number(totalAmount || 0),

      status: "processing",
      statusHistory: [{ status: "processing", at: now }],
    };

    const order = await Order.create(orderDoc);

    // Best-effort: notify relevant admins by email (if SMTP configured)
    if (isSmtpConfigured()) {
      try {
        const adminIds = Array.from(
          new Set(
            (orderDoc.items || [])
              .map((it: any) => (it?.admin ? String(it.admin) : ""))
              .filter(Boolean)
          )
        );

        if (adminIds.length) {
          const admins = await Admin.find({ _id: { $in: adminIds } }).select("email").lean();
          const emailById = new Map<string, string>();
          admins.forEach((a: any) => {
            if (a?.email) emailById.set(String(a._id), String(a.email));
          });

          const shipName = fullName;
          const shipAddr = fullAddress;

          const adminToItems = new Map<string, any[]>();
          (orderDoc.items || []).forEach((it: any) => {
            const aid = it?.admin ? String(it.admin) : "";
            if (!aid) return;
            const arr = adminToItems.get(aid) || [];
            arr.push(it);
            adminToItems.set(aid, arr);
          });

          await Promise.all(
            Array.from(adminToItems.entries()).map(async ([aid, its]) => {
              const to = emailById.get(aid);
              if (!to) return;

              const list = its
                .map(
                  (x: any) =>
                    `${String(x?.title || "Product")} x${Number(x?.qty || 1)} (₹${Number(x?.price || 0)})`
                )
                .join("<br/>");

              await sendMail({
                to,
                subject: `New order received: ${orderId}`,
                html: `
                  <div style="font-family:system-ui,Segoe UI,Arial">
                    <h2>New Order</h2>
                    <p><b>Order ID:</b> ${orderId}</p>
                    <p><b>Customer:</b> ${shipName}</p>
                    <p><b>Phone:</b> ${shipping?.phone || ""}</p>
                    <p><b>Address:</b> ${shipAddr}</p>
                    <p><b>Payment:</b> ${String(paymentMethod || "")}</p>
                    <p style="margin-top:12px"><b>Items:</b><br/>${list}</p>
                  </div>
                `,
              });
            })
          );
        }
      } catch (e: any) {
        console.error("ORDER ADMIN NOTIFY EMAIL FAILED:", e);
      }
    }

    return NextResponse.json({ message: "Order placed successfully ✅", order }, { status: 201 });
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

