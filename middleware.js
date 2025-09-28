import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtected = pathname.startsWith("/profiil") || pathname.startsWith("/vestlus");

  if (!isAdminRoute && !isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isAdminRoute) {
    if (!token || token.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/registreerimine";
      url.searchParams.set("reason", token ? "not-authorized" : "not-logged-in");
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/registreerimine";
    url.searchParams.set("reason", "not-logged-in");
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (token.subActive !== true) {
    const url = req.nextUrl.clone();
    url.pathname = "/tellimus";
    url.searchParams.set("reason", "no-sub");
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profiil/:path*", "/vestlus/:path*", "/admin/:path*"],
};
