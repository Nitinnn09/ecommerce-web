import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectdb } from "@/lib/db";
import User from "@/lib/model/user";

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
    if (!token) return NextResponse.json({ message: "No token" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      image: user.image || "",
    });
  } catch (e: any) {
    return NextResponse.json({ message: "Invalid token", error: String(e?.message || e) }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectdb();

    const token = getToken(req);
    if (!token) return NextResponse.json({ message: "No token" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const body = await req.json();

    const updated = await User.findByIdAndUpdate(
      decoded.id,
      {
        name: body.name,
        email: body.email?.toLowerCase(),
        phone: body.phone,
        image: body.image,
      },
      { new: true }
    ).select("-password");

    if (!updated) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: updated._id,
      name: updated.name || "",
      email: updated.email || "",
      phone: updated.phone || "",
      image: updated.image || "",
    });
  } catch (e: any) {
    return NextResponse.json({ message: "Invalid token", error: String(e?.message || e) }, { status: 401 });
  }
}
