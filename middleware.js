// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Jäta well-known (ACME, OIDC jne) rahule
  if (pathname.startsWith("/.well-known")) {
    return NextResponse.next();
  }

  // Ära sekku next-auth ja _next staticusse
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // CORS preflight (nt RAG admin fetch): lase läbi
  if (req.method === "OPTIONS") {
    return NextResponse.next();
  }

  // Lase kogu /api/rag/* Next.js API-l endal auth'i teha (route kontrollib ise sessiooni)
  if (pathname.startsWith("/api/rag")) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedPage =
    pathname.startsWith("/profiil") || pathname.startsWith("/vestlus");

  // Lase kõik muu läbi
  if (!isAdminPage && !isProtectedPage) {
    return NextResponse.next();
  }

  let token = null;
  if (isAdminPage || isProtectedPage) {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  }
  const role = String(token?.role ?? token?.user?.role ?? "").toUpperCase();
  const isAdmin = token?.isAdmin === true || role === "ADMIN";
  const callbackUrl = pathname + (search || "");

  // --- Lehed (redirect loogika jääb samaks) ---
  if (isAdminPage && (!token || !isAdmin)) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/signin";
    url.searchParams.set("reason", token ? "not-authorized" : "not-logged-in");
    url.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(url);
  }

  if (isProtectedPage && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/signin";
    url.searchParams.set("reason", "not-logged-in");
    url.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(url);
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
