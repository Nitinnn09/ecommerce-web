import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectdb } from "@/lib/db";
import Admin from "@/lib/model/admin";
import { isSmtpConfigured, sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  try {
    await connectdb();

    if (!isSmtpConfigured()) {
      return NextResponse.json(
        {
          message:
            "Email (SMTP) is not configured. Please set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM in .env.local",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const email = String(body?.email || "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "Email required" }, { status: 400 });

    const admin: any = await Admin.findOne({ email });

    // Always return generic success to avoid leaking which emails exist
    if (!admin) {
      return NextResponse.json({ message: "If the account exists, a reset link was sent." }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    admin.resetTokenHash = sha256(token);
    admin.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await admin.save();

    const base = new URL(req.url);
    const origin = `${req.headers.get("x-forwarded-proto") || base.protocol.replace(":", "")}://${
      req.headers.get("host") || base.host
    }`;

    const resetUrl = new URL("/admin/reset-password", origin);
    resetUrl.searchParams.set("token", token);

    await sendMail({
      to: email,
      subject: "Reset your admin password",
      html: `
        <div style="font-family:system-ui,Segoe UI,Arial">
          <h2>Reset Admin Password</h2>
          <p>Click the button below to reset your password. This link expires in 30 minutes.</p>
          <p style="margin-top:16px">
            <a href="${resetUrl.toString()}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#006064;color:#fff;text-decoration:none;font-weight:700">Reset Password</a>
          </p>
          <p style="color:#64748b;font-size:12px">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "If the account exists, a reset link was sent." }, { status: 200 });
  } catch (e: any) {
    console.error("ADMIN FORGOT PASSWORD ERROR:", e);
    return NextResponse.json({ message: String(e?.message || e) }, { status: 500 });
  }
}

