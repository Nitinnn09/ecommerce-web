import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Admin from "@/lib/model/admin";
import { connectdb } from "@/lib/db";
import crypto from "crypto";
import { isSmtpConfigured, sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "kumarnitin84044@gmail.com";
const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const APPROVAL_REQUIRED = String(process.env.ADMIN_APPROVAL_REQUIRED || "").toLowerCase() === "true";

export async function POST(req: Request) {
  try {
    await connectdb();

    const { email, password, username, gstNo, businessProof } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email & password required" }, { status: 400 });
    }

    if (!gstNo || String(gstNo).trim().length !== 15) {
      return NextResponse.json({ message: "Valid GST No (15 chars) required" }, { status: 400 });
    }

    if (!businessProof || !String(businessProof).trim()) {
      return NextResponse.json({ message: "Business proof required" }, { status: 400 });
    }

    if (APPROVAL_REQUIRED && !isSmtpConfigured()) {
      return NextResponse.json(
        {
          message:
            "Email (SMTP) is not configured. Admin approval email cannot be sent. Please set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM in .env.local",
        },
        { status: 500 }
      );
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const approvalToken = APPROVAL_REQUIRED ? crypto.randomBytes(32).toString("hex") : "";
    const approvalTokenHash = approvalToken ? sha256(approvalToken) : "";
    const approvalTokenExpiresAt = approvalToken ? new Date(Date.now() + 1000 * 60 * 60 * 24) : null; // 24h

    const admin = await Admin.create({
      username: String(username || "").trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      gstNo: String(gstNo).trim().toUpperCase(),
      businessProof: String(businessProof).trim(),
      status: APPROVAL_REQUIRED ? "pending" : "active",
      approvalTokenHash,
      approvalTokenExpiresAt,
      role: "admin",
    });

    // If approval flow is disabled: create admin immediately (no email needed)
    if (!APPROVAL_REQUIRED) {
      return NextResponse.json({ message: "Admin created successfully. Please login." }, { status: 201 });
    }

    const base = new URL(req.url);
    const origin = `${req.headers.get("x-forwarded-proto") || base.protocol.replace(":", "")}://${
      req.headers.get("host") || base.host
    }`;

    const approveUrl = new URL("/api/admin/approve", origin);
    approveUrl.searchParams.set("token", approvalToken);

    const rejectUrl = new URL("/api/admin/reject", origin);
    rejectUrl.searchParams.set("token", approvalToken);

    const proofUrl = String(businessProof || "").startsWith("http")
      ? String(businessProof)
      : new URL(String(businessProof || ""), origin).toString();

    try {
      await sendMail({
        to: OWNER_EMAIL,
        subject: `Admin access request: ${admin.email}`,
        html: `
      <div style="font-family:system-ui,Segoe UI,Arial">
        <h2>New Admin Request</h2>
        <p><b>Email:</b> ${admin.email}</p>
        <p><b>Username:</b> ${String(username || "")}</p>
        <p><b>GST No:</b> ${String(gstNo || "")}</p>
        <p><b>Business proof:</b> <a href="${proofUrl}">View</a></p>
        <p style="margin-top:16px">
          <a href="${approveUrl.toString()}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#16a34a;color:#fff;text-decoration:none;font-weight:700">Approve</a>
          <a href="${rejectUrl.toString()}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#dc2626;color:#fff;text-decoration:none;font-weight:700;margin-left:10px">Reject</a>
        </p>
        <p style="color:#64748b;font-size:12px">This link expires in 24 hours. After approve/reject, admin ko email notification bhi jayega.</p>
      </div>
    `,
      });
    } catch (e: any) {
      console.error("ADMIN APPROVAL EMAIL FAILED:", e);
      // rollback so admin isn't stuck pending without approval email
      await Admin.deleteOne({ _id: admin._id }).catch(() => {});
      return NextResponse.json(
        {
          message: `Failed to send approval email: ${String(e?.message || e)}`,
          hint: "Check SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM in .env.local and restart dev server.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Request submitted. Owner approval required." }, { status: 201 });
  } catch (e: any) {
    console.error("ADMIN REGISTER ERROR:", e);
    return NextResponse.json({ message: String(e?.message || e) }, { status: 500 });
  }
}
