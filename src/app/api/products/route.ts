import { NextResponse } from "next/server";
import { connectdb } from "@/lib/db";
import Product from "@/lib/model/product";

export async function GET(req: Request) {
  await connectdb();

  const { searchParams } = new URL(req.url);

  // ✅ filters
  const category = searchParams.get("category"); // furniture, clothes, bodycare etc
  const limit = searchParams.get("limit");       // "8", "12"
  const q = searchParams.get("q");               // optional search

  const filter: any = {};

  if (category && category !== "all") {
    filter.category = category;
  }

  // optional search by title
  if (q) {
    filter.title = { $regex: q, $options: "i" };
  }

  let query = Product.find(filter).sort({ createdAt: -1 });

  if (limit) {
    query = query.limit(Number(limit));
  }

  const products = await query;
  return NextResponse.json(products);
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
