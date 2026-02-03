import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectdb } from "@/lib/db";
import Product from "@/lib/model/product";

const isValidId = (id?: string) =>
  !!id && mongoose.Types.ObjectId.isValid(id);

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectdb();

    const id = params?.id;
    if (!isValidId(id)) {
      return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err: any) {
    console.error("GET /api/products/[id] error:", err);
    return NextResponse.json(
      { message: "Server error", error: err?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectdb();

    const id = params?.id;
    if (!isValidId(id)) {
      return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        title: body.title,
        price: Number(body.price),
        oldPrice: body.oldPrice ? Number(body.oldPrice) : undefined,
        discount: body.discount,
        image: body.image,
        desc: body.desc,
        bullets: body.bullets || [],
        category: body.category || "general",
        stock: body.stock ? Number(body.stock) : 1,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/products/[id] error:", err);
    return NextResponse.json(
      { message: "Server error", error: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectdb();

    const id = params?.id;
    if (!isValidId(id)) {
      return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json(
      { message: "Server error", error: err?.message },
      { status: 500 }
    );
  }
}
