import { NextResponse } from "next/server";
import { connectdb } from "@/lib/db";
import User from "@/lib/model/user";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    await connectdb();

    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/adminToken=([^;]+)/);
    const token = match?.[1] || null;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // DB se sab users fetch karo
    const users = await User.find({}, { password: 0 }); // password hide kar do

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
