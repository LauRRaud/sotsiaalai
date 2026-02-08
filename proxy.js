import { NextResponse } from "next/server";
function getForwardedHeader(req, name) {
  const raw = req.headers.get(name);
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  return first || null;
}
export async function proxy(req) {
  const {
    pathname
  } = req.nextUrl;
  const m = pathname.match(/^\/(et|ru|en)(\/.*)?$/);
  if (m) {
    const locale = m[1];
    const rest = m[2] || "/";
    const dest = new URL(req.url);
    const forwardedProto = getForwardedHeader(req, "x-forwarded-proto");
    const forwardedHost = getForwardedHeader(req, "x-forwarded-host");
    const fallbackHost = req.headers.get("host");
    if (forwardedProto) dest.protocol = `${forwardedProto}:`;
    if (forwardedHost || fallbackHost) dest.host = forwardedHost || fallbackHost;
    dest.pathname = rest;
    const res = NextResponse.redirect(dest, 308);
    res.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    });
    return res;
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/(et|ru|en)", "/(et|ru|en)/:path*"]
};
