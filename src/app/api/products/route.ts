import { NextResponse } from "next/server";
import { connectdb } from "@/lib/db";
import Product from "@/lib/model/product";

export async function GET(req: Request) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const categoryRaw = searchParams.get("category") || "";
    const category = categoryRaw.trim();

    const filter: any = {};

    // If category is passed, match it case-insensitively (Electrical/electrical both OK)
    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Products API error", error: err?.message },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  await connectdb();
  const body = await req.json();

  const product = await Product.create({
    title: body.title,
    price: Number(body.price),
    oldPrice: body.oldPrice ? Number(body.oldPrice) : undefined,
    discount: body.discount,
    image: body.image,
    desc: body.desc,
    bullets: body.bullets || [],
    category: body.category || "general",
    stock: body.stock ? Number(body.stock) : 1,
  });

  return NextResponse.json(product, { status: 201 });
}
