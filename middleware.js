// middleware.js
import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Püüa /et, /ru, /en ja kõik nende alamteed
  const m = pathname.match(/^\/(et|ru|en)(\/.*)?$/);
  if (m) {
    const locale = m[1];
    const rest = m[2] || "/";

    // Build redirect target using the incoming request URL as base to preserve host.
    // This avoids accidentally redirecting to http://localhost:3000 on non-local hosts.
    const dest = new URL(req.url);
    dest.pathname = rest; // canonical path without the locale prefix

    const res = NextResponse.redirect(dest, 308);
    res.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  // Kõik muu edasi
  return NextResponse.next();
}

export const config = {
  // Käivita middleware just nendel radadel
  matcher: ["/(et|ru|en)", "/(et|ru|en)/:path*"],
};
