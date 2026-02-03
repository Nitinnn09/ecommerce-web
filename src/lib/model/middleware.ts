import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("adminToken");

  if (
    req.nextUrl.pathname.startsWith("/admin") &&
    !req.nextUrl.pathname.includes("/admin/login")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
