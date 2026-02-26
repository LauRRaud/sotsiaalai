import { NextResponse } from "next/server";
const ALLOWED_REDIRECT_HOSTS = String(process.env.ALLOWED_REDIRECT_HOSTS || "")
  .split(",")
  .map(h => h.trim().toLowerCase())
  .filter(Boolean);

function getForwardedHeader(req, name) {
  const raw = req.headers.get(name);
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  return first || null;
}

function normalizeHost(value) {
  if (!value) return null;
  const candidate = String(value).trim().toLowerCase();
  if (!candidate) return null;
  if (!/^[a-z0-9.\-:[\]]+$/.test(candidate)) return null;
  return candidate;
}

function hostWithoutPort(host) {
  if (!host) return "";
  if (host.startsWith("[") && host.includes("]")) return host;
  return host.replace(/:\d+$/, "");
}

function isLocalHost(host) {
  const base = hostWithoutPort(host || "");
  return base === "localhost" || base === "127.0.0.1" || base === "::1" || base === "[::1]";
}

function sanitizeRedirectHost(host) {
  if (!host) return null;
  // Never expose internal upstream ports (e.g. :3000) to public browser redirects.
  // Keep ports only for local development hosts.
  if (isLocalHost(host)) return host;
  return hostWithoutPort(host);
}

function canUseForwardedHost(forwardedHost, fallbackHost) {
  if (!forwardedHost) return false;
  if (fallbackHost && forwardedHost === fallbackHost) return true;
  if (!ALLOWED_REDIRECT_HOSTS.length) return false;
  const forwardedBase = hostWithoutPort(forwardedHost);
  return ALLOWED_REDIRECT_HOSTS.includes(forwardedHost) || ALLOWED_REDIRECT_HOSTS.includes(forwardedBase);
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
    const forwardedProtoRaw = getForwardedHeader(req, "x-forwarded-proto");
    const forwardedProto = forwardedProtoRaw === "https" || forwardedProtoRaw === "http" ? forwardedProtoRaw : null;
    const forwardedHost = normalizeHost(getForwardedHeader(req, "x-forwarded-host"));
    const fallbackHost = normalizeHost(req.headers.get("host"));
    if (forwardedProto) dest.protocol = `${forwardedProto}:`;
    if (canUseForwardedHost(forwardedHost, fallbackHost)) {
      dest.host = sanitizeRedirectHost(forwardedHost);
    } else if (fallbackHost) {
      dest.host = sanitizeRedirectHost(fallbackHost);
    }
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
