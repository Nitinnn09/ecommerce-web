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
    email: "admin@gmail.com",
    password: hash,
    role: "admin",
  });

  return NextResponse.json({
    message: "Admin created successfully",
    login: { email: "admin@gmail.com", password: "admin123" },
  });
}
