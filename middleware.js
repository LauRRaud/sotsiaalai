// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname, search } = url;

  // Tehnilised ja avalikud rajad: jäta puutumata
  if (
    pathname.startsWith("/.well-known") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/logo/")
  ) {
    return NextResponse.next();
  }

  // NextAuth enda API
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // CORS preflight
  if (req.method === "OPTIONS") {
    return NextResponse.next();
  }

  // RAG proxy on avalik (edasi kontrollivad server-route'id)
  if (pathname === "/api/rag" || pathname.startsWith("/api/rag/")) {
    return NextResponse.next();
  }

  // Kaitstavad lehed
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isProtectedPage =
    pathname === "/profiil" ||
    pathname.startsWith("/profiil/") ||
    pathname === "/vestlus" ||
    pathname.startsWith("/vestlus/");

  // Kõik muu jääb vabaks
  if (!isAdminPage && !isProtectedPage) {
    return NextResponse.next();
  }

  // Loe token (JWT) — vajas NEXTAUTH_SECRET väärtust
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const role = String(token?.role ?? token?.user?.role ?? "").toUpperCase();
  const isAdmin = token?.isAdmin === true || role === "ADMIN";
  const callbackUrl = pathname + (search || "");

  // Adminilehed: nõua admini
  if (isAdminPage && (!token || !isAdmin)) {
    const dest = req.nextUrl.clone();
    dest.pathname = "/api/auth/signin";
    dest.searchParams.set("reason", token ? "not-authorized" : "not-logged-in");
    dest.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(dest);
  }

  // Tavalised kaitstud lehed: nõua sisselogimist
  if (isProtectedPage && !token) {
    const dest = req.nextUrl.clone();
    dest.pathname = "/api/auth/signin";
    dest.searchParams.set("reason", "not-logged-in");
    dest.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profiil/:path*",
    "/vestlus/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
