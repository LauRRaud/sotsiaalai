import { NextResponse } from "next/server";

export async function proxy(req) {
  const {
    pathname
  } = req.nextUrl;
  const m = pathname.match(/^\/(et|ru|en)(\/.*)?$/);
  if (m) {
    const locale = m[1];
    const rest = m[2] || "/";
    const location = `${rest}${req.nextUrl.search || ""}`;
    const res = new NextResponse(null, { status: 308 });
    // Use relative Location so internal upstream host/port can never leak.
    res.headers.set("Location", location);
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
