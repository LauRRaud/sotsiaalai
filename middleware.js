// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Ära sekku next-auth ja _next staticusse
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // CORS preflight (nt RAG admin fetch): lase läbi
  if (req.method === "OPTIONS") {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi  = pathname.startsWith("/api/rag");
  const isProtectedPage =
    pathname.startsWith("/profiil") || pathname.startsWith("/vestlus");

  // Lase kõik muu läbi
  if (!isAdminPage && !isAdminApi && !isProtectedPage) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = String(token?.role ?? token?.user?.role ?? "").toUpperCase();
  const isAdmin = token?.isAdmin === true || role === "ADMIN";

  // --- API ( /api/rag/* ) -> TAGASTA JSON, mitte redirect ---
  if (isAdminApi) {
    if (!token)  return NextResponse.json({ error: "not-logged-in" },  { status: 401 });
    if (!isAdmin) return NextResponse.json({ error: "not-authorized" }, { status: 403 });
    return NextResponse.next();
  }

  // --- Lehed (redirect loogika jääb samaks) ---
  if (isAdminPage && (!token || !isAdmin)) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/signin";
    url.searchParams.set("reason", token ? "not-authorized" : "not-logged-in");
    url.searchParams.set("callbackUrl", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  if (isProtectedPage && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/signin";
    url.searchParams.set("reason", "not-logged-in");
    url.searchParams.set("callbackUrl", pathname + (search || ""));
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
    "/api/rag/:path*", // kaitse RAG API-d
  ],
};
