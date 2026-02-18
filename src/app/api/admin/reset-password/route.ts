import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectdb } from "@/lib/db";
import Admin from "@/lib/model/admin";

export const runtime = "nodejs";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  try {
    await connectdb();

    const body = await req.json();
    const token = String(body?.token || "").trim();
    const password = String(body?.password || "");

    if (!token || !password) {
      return NextResponse.json({ message: "token & new password required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const tokenHash = sha256(token);
    const admin: any = await Admin.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!admin) return NextResponse.json({ message: "Invalid/expired reset link" }, { status: 400 });

    admin.password = await bcrypt.hash(password, 10);
    admin.resetTokenHash = "";
    admin.resetTokenExpiresAt = null;
    await admin.save();

    return NextResponse.json({ message: "Password reset successful. Please login." }, { status: 200 });
  } catch (e: any) {
    console.error("ADMIN RESET PASSWORD ERROR:", e);
    return NextResponse.json({ message: String(e?.message || e) }, { status: 500 });
  }
}

