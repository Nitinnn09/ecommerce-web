import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_FREE: string[] = [
  "/admin/register",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = req.cookies.get("adminToken")?.value;
  const isAuthFree = AUTH_FREE.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (token && pathname === "/admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  if (!token && !isAuthFree) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/register";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
