import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectdb } from "@/lib/db";
import Admin from "@/lib/model/admin";
import { isSmtpConfigured, sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function GET(req: Request) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const token = (searchParams.get("token") || "").trim();
    if (!token) return NextResponse.json({ message: "token required" }, { status: 400 });

    const tokenHash = sha256(token);

    const admin: any = await Admin.findOne({
      approvalTokenHash: tokenHash,
      approvalTokenExpiresAt: { $gt: new Date() },
      status: "pending",
    });

    if (!admin) return NextResponse.json({ message: "Invalid/expired token" }, { status: 400 });

    admin.status = "active";
    admin.approvalTokenHash = "";
    admin.approvalTokenExpiresAt = null;
    await admin.save();

    const base = new URL(req.url);
    const origin = `${req.headers.get("x-forwarded-proto") || base.protocol.replace(":", "")}://${req.headers.get("host") || base.host}`;

    if (isSmtpConfigured() && admin?.email) {
      try {
        await sendMail({
          to: String(admin.email),
          subject: "Admin access approved",
          html: `
            <div style="font-family:system-ui,Segoe UI,Arial">
              <h2>Approved ✅</h2>
              <p>Your admin access has been approved.</p>
              <p>Login: <a href="${new URL("/admin/register", origin).toString()}">Admin Login</a></p>
            </div>
          `,
        });
      } catch (e: any) {
        console.error("ADMIN APPROVAL NOTIFY EMAIL FAILED:", e);
      }
    }

    return new NextResponse(
      `<html><body style="font-family:system-ui;padding:24px"><h2>Approved ✅</h2><p>Admin access enabled for <b>${admin.email}</b>.</p></body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  } catch (e: any) {
    return NextResponse.json({ message: "Server error", error: String(e?.message || e) }, { status: 500 });
  }
}

