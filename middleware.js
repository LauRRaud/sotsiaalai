// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Märgista admini lehed + admini API
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/rag");
  const isProtectedPage =
    pathname.startsWith("/profiil") || pathname.startsWith("/vestlus");

  // Lase kõik muu läbi
  if (!isAdminPage && !isAdminApi && !isProtectedPage) {
    return NextResponse.next();
  }

  // Loe JWT (v4). Vaja NEXTAUTH_SECRET väärtust .env-is
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Tuleta "kas on admin?"
  const role =
    String(
      token?.role ??
        token?.user?.role ??
        ""
    ).toUpperCase();
  const isAdmin = token?.isAdmin === true || role === "ADMIN";

  // Admini kaitse (nii /admin/* lehed kui /api/rag/* endpointid)
  if (isAdminPage || isAdminApi) {
    if (!token || !isAdmin) {
      const url = req.nextUrl.clone();
      // Lehe puhul suuna loginile; API puhul samuti (parem kui 401 JSON keskelt)
      url.pathname = "/api/auth/signin";
      url.searchParams.set("reason", token ? "not-authorized" : "not-logged-in");
      url.searchParams.set("callbackUrl", pathname + (search || ""));
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Kaitstud lehed (profiil/vestlus) — nõua sisselogimist
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/signin";
    url.searchParams.set("reason", "not-logged-in");
    url.searchParams.set("callbackUrl", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // Vestlus vajab aktiivset tellimust (admin möödub)
  if (pathname.startsWith("/vestlus")) {
    if (!isAdmin && token.subActive !== true) {
      const url = req.nextUrl.clone();
      url.pathname = "/tellimus";
      url.searchParams.set("reason", "no-sub");
      url.searchParams.set("callbackUrl", pathname + (search || ""));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Kata lehed + admini API
  matcher: [
    "/profiil/:path*",
    "/vestlus/:path*",
    "/admin",
    "/admin/:path*",
    "/api/rag/:path*", // ⬅️ kaitse RAG API-d
  ],
};
