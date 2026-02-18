import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Admin from "@/lib/model/admin";
import { connectdb } from "@/lib/db";

export async function GET() {
  await connectdb();

  const exist = await Admin.findOne({ email: "admin@gmail.com" });
  if (exist) {
    return NextResponse.json({ message: "Admin already exists" });
  }

  const hash = await bcrypt.hash("admin123", 10);

  await Admin.create({
    username: "admin",
    email: "admin@gmail.com",
    password: hash,
    gstNo: "22AAAAA0000A1Z5",
    businessProof: "/uploads/seed-proof.png",
    status: "active",
    role: "admin",
  });

  return NextResponse.json({
    message: "Admin created successfully",
    login: { email: "admin@gmail.com", password: "admin123" },
  });
}
