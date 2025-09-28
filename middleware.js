// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = pathname.startsWith("/profiil") || pathname.startsWith("/vestlus");

  // Lase kõik mujal läbi
  if (!isAdminRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Loe JWT (v4): vajab NEXTAUTH_SECRET väärtust .env-is
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Admini kaitse
  if (isAdminRoute) {
    if (!token || token.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      // Kasuta NextAuthi default sisselogimislehte
      url.pathname = "/api/auth/signin";
      url.searchParams.set("reason", token ? "not-authorized" : "not-logged-in");
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Kaitstud lehed (profiil/vestlus) — nõua sisselogimist
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/signin";
    url.searchParams.set("reason", "not-logged-in");
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  // Vestluse jaoks nõua aktiivset tellimust
  if (pathname.startsWith("/vestlus")) {
    if (token.role === "ADMIN" || token.isAdmin === true) {
      return NextResponse.next();
    }

    if (token.subActive !== true) {
      const url = req.nextUrl.clone();
      url.pathname = "/tellimus";
      url.searchParams.set("reason", "no-sub");
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // kata nii /admin kui ka selle juur
  matcher: ["/profiil/:path*", "/vestlus/:path*", "/admin", "/admin/:path*"],
};
