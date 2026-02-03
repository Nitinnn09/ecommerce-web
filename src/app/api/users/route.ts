import { NextResponse } from "next/server";
import { connectdb } from "@/lib/db";
import User from "@/lib/model/user";

export async function GET() {
  try {
    await connectdb();

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
