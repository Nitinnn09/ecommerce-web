import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectdb } from "@/lib/db";
import Admin from "@/lib/model/admin";

function getAdminId(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/adminToken=([^;]+)/);
  const token = match?.[1] || null;
  if (!token) return null;

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    return payload?.id ? String(payload.id) : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    await connectdb();

    const adminId = getAdminId(req);
    if (!adminId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const admin = await Admin.findById(adminId).lean();
    if (!admin) return NextResponse.json({ message: "Admin not found" }, { status: 404 });

    return NextResponse.json(
      {
        admin: {
          id: String((admin as any)._id),
          email: (admin as any).email || "",
          username: (admin as any).username || "",
          gstNo: (admin as any).gstNo || "",
          businessProof: (admin as any).businessProof || "",
          avatar: (admin as any).avatar || "",
          businessName: (admin as any).businessName || "",
          businessDescription: (admin as any).businessDescription || "",
          phone: (admin as any).phone || "",
          address: (admin as any).address || "",
          status: (admin as any).status || "active",
          createdAt: (admin as any).createdAt || null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("ADMIN ME ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectdb();

    const adminId = getAdminId(req);
    if (!adminId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as any;

    const next: any = {};

    if (typeof body.username === "string") next.username = body.username.trim().slice(0, 80);
    if (typeof body.avatar === "string") next.avatar = body.avatar.trim().slice(0, 500);
    if (typeof body.businessName === "string") next.businessName = body.businessName.trim().slice(0, 120);
    if (typeof body.businessDescription === "string")
      next.businessDescription = body.businessDescription.trim().slice(0, 1000);
    if (typeof body.phone === "string") next.phone = body.phone.trim().slice(0, 30);
    if (typeof body.address === "string") next.address = body.address.trim().slice(0, 300);

    if (typeof body.gstNo === "string") {
      const gst = body.gstNo.trim().toUpperCase();
      if (gst && gst.length !== 15) {
        return NextResponse.json({ message: "GST No must be 15 characters" }, { status: 400 });
      }
      next.gstNo = gst;
    }

    if (typeof body.businessProof === "string") next.businessProof = body.businessProof.trim().slice(0, 500);

    const admin = await Admin.findByIdAndUpdate(adminId, { $set: next }, { new: true }).lean();
    if (!admin) return NextResponse.json({ message: "Admin not found" }, { status: 404 });

    return NextResponse.json(
      {
        message: "Profile updated",
        admin: {
          id: String((admin as any)._id),
          email: (admin as any).email || "",
          username: (admin as any).username || "",
          gstNo: (admin as any).gstNo || "",
          businessProof: (admin as any).businessProof || "",
          avatar: (admin as any).avatar || "",
          businessName: (admin as any).businessName || "",
          businessDescription: (admin as any).businessDescription || "",
          phone: (admin as any).phone || "",
          address: (admin as any).address || "",
          status: (admin as any).status || "active",
          createdAt: (admin as any).createdAt || null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("ADMIN ME UPDATE ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
