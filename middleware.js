// middleware.js
import { NextResponse } from "next/server";

function getForwardedHeader(req, name) {
  const raw = req.headers.get(name);
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  return first || null;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Püüa /et, /ru, /en ja kõik nende alamteed
  const m = pathname.match(/^\/(et|ru|en)(\/.*)?$/);
  if (m) {
    const locale = m[1];
    const rest = m[2] || "/";

    // Rekonstrueeri siht-URL kasutades X-Forwarded-* päiseid, et säilitada õige domeen/proto.
    const dest = new URL(req.url);
    const forwardedProto = getForwardedHeader(req, "x-forwarded-proto");
    const forwardedHost = getForwardedHeader(req, "x-forwarded-host");
    const fallbackHost = req.headers.get("host");
    if (forwardedProto) dest.protocol = `${forwardedProto}:`;
    if (forwardedHost || fallbackHost) dest.host = forwardedHost || fallbackHost;
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
