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

  if ((admin as any).status && (admin as any).status !== "active") {
    const status = String((admin as any).status || "");
    if (status === "rejected") {
      return NextResponse.json({ message: "Admin request rejected by owner" }, { status: 403 });
    }
    return NextResponse.json({ message: "Admin account pending owner approval" }, { status: 403 });
  }

  const token = signToken({ id: admin._id, role: admin.role });

  const res = NextResponse.json({
    message: "Login successful",
    admin: {
      id: admin._id,
      email: admin.email,
      username: (admin as any).username || "",
      role: admin.role,
    },
  });

  res.cookies.set("adminToken", token, {
    httpOnly: true,
    path: "/",
  });

  return res;
}
