import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectdb } from "@/lib/db";
import User from "@/lib/model/user";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name, email, password } = body;

    if (!type) {
      return NextResponse.json({ message: "type required (login/register)" }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ message: "Email & password required" }, { status: 400 });
    }

    await connectdb();

    // ✅ REGISTER
    if (type === "register") {
      if (!name) {
        return NextResponse.json({ message: "Name required" }, { status: 400 });
      }

      const exist = await User.findOne({ email: email.toLowerCase() });
      if (exist) {
        return NextResponse.json({ message: "Email already registered" }, { status: 409 });
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashed,
      });

      return NextResponse.json(
        { message: "Registered successfully", user: { id: user._id, name: user.name, email: user.email } },
        { status: 201 }
      );
    }

    // ✅ LOGIN
    if (type === "login") {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      const res = NextResponse.json(
        { message: "Login successful", user: { id: user._id, name: user.name, email: user.email } },
        { status: 200 }
      );

      // optional cookie
      res.cookies.set("token", token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("USERLOGIN API ERROR:", err);
    return NextResponse.json({ message: "Server error", error: String(err?.message || err) }, { status: 500 });
  }
}
