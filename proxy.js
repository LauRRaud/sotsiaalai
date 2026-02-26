import { NextResponse } from "next/server";

export async function proxy(req) {
  const {
    pathname
  } = req.nextUrl;
  const m = pathname.match(/^\/(et|ru|en)(\/.*)?$/);
  if (m) {
    const locale = m[1];
    const rest = m[2] || "/";
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = rest;
    // Internal rewrite avoids absolute redirect URL construction and
    // therefore cannot leak internal upstream ports (e.g. :3000).
    const res = NextResponse.rewrite(rewriteUrl);
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
