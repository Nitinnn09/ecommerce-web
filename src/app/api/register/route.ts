import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Admin from "@/lib/model/admin";
import { connectdb } from "@/lib/db";

export async function POST(req: Request) {
  await connectdb();

  const { email, password } = await req.json();

  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

  if (existingAdmin) {
    return NextResponse.json(
      { message: "Admin already exists" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "admin",
  });

  return NextResponse.json(
    { message: "Admin created successfully" },
    { status: 201 }
  );
}
