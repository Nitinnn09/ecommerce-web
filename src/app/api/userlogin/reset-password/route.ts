import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectdb } from "@/lib/db";
import User from "@/lib/model/user";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ message: "Email & new password required" }, { status: 400 });
    }

    await connectdb();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("RESET PASSWORD API ERROR:", err);
    return NextResponse.json({ message: "Server error", error: String(err?.message || err) }, { status: 500 });
  }
}

