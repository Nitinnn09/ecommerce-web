import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Admin from "@/lib/model/admin";
import { connectdb } from "@/lib/db";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  await connectdb();

  const { email, password } = await req.json();

  // lowercase email for consistency
  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin) {
    return NextResponse.json(
      { message: "Admin not found" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return NextResponse.json(
      { message: "Invalid password" },
      { status: 401 }
    );
  }

  const token = signToken({ id: admin._id, role: admin.role });

  const res = NextResponse.json({ message: "Login successful" });

  res.cookies.set("adminToken", token, {
    httpOnly: true,
    path: "/",
  });

  return res;
}
