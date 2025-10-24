// proxy.js — Next 16 request proxy (Node runtime)
// NB: ei püüa "/" — avaleht renderdub App Routeris (modal jms)

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import {
  SUPPORTED_LOCALES,
  LOCALE_COOKIE,
  COOKIE_BASE_OPTIONS,
  normalizeLocale,
  readPreferencesFromCookies,
  CONTRAST_COOKIE,
  FONT_SIZE_COOKIE,
  MOTION_COOKIE,
  UPDATED_AT_COOKIE,
  prismaPreferenceToValues,
} from "@/lib/preferences";

const LOCALE_SET = new Set(SUPPORTED_LOCALES);

// Abiks
function firstSegment(pathname) {
  const seg = pathname.split("/").filter(Boolean);
  return seg[0] || null;
}

export default async function proxy(req) {
  const url = req.nextUrl.clone();
  const { pathname, search } = url;
  const cookies = req.cookies;

  // Luba auth endpoint ja muud tehnilised päringud (igaks juhuks)
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (req.method === "OPTIONS") return NextResponse.next();

  // ⛳️ Kaitstavad lehed (login gate): /admin, /profiil, /vestlus
  const protectedRoots = ["/admin", "/profiil", "/vestlus"];
  const isProtectedRoot = protectedRoots.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`)
  );
  if (isProtectedRoot) {
    const token = await getToken({
      req,
      // proovi mõlemat nime, et katta v4/v5 env-id
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    });

    const role = String(token?.role ?? token?.user?.role ?? "").toUpperCase();
    const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
    const isAdmin = token?.isAdmin === true || role === "ADMIN";
    const callbackUrl = pathname + (search || "");

    if (!token || (isAdminPage && !isAdmin)) {
      const dest = req.nextUrl.clone();
      dest.pathname = "/api/auth/signin";
      dest.search = "";
      dest.searchParams.set("reason", !token ? "not-logged-in" : "not-authorized");
      dest.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(dest);
    }
  }

  // 🌍 Keelesegmenti küpsis URL-ist: /et, /ru, /en
  const seg = firstSegment(pathname);
  if (seg && LOCALE_SET.has(seg)) {
    const cookieLocaleValue = normalizeLocale(cookies.get(LOCALE_COOKIE)?.value);
    if (cookieLocaleValue !== seg) {
      const res = NextResponse.next();
      res.cookies.set({
        name: LOCALE_COOKIE, // nt "lang"
        value: seg,
        ...COOKIE_BASE_OPTIONS,
      });
      // jätkame ülejäänud sünkiga samas vastuses
      await syncPrefsFromDbIfNeeded({ req, res });
      return res;
    }
  }

  // 🗂 Eelistuste sünk DB → küpsised (kui kasutaja sees)
  const res = NextResponse.next();
  await syncPrefsFromDbIfNeeded({ req, res });
  return res;
}

// ————————————————————————————————————————————————————————————————
// DB → cookie sünk (vajalik vaid kui kasutaja on sisse logitud)
// ————————————————————————————————————————————————————————————————
async function syncPrefsFromDbIfNeeded({ req, res }) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    });
    const userId = token?.id ? String(token.id) : null;
    if (!userId) return;

    const record = await prisma.userPreference.findUnique({
      where: { userId },
      select: { contrast: true, fontSize: true, motion: true, updatedAt: true, locale: true },
    });
    const dbPrefs = prismaPreferenceToValues(record);
    if (!dbPrefs?.updatedAt) return;

    // kirjuta uuemad väärtused küpsistesse
    const cookiePrefs = readPreferencesFromCookies(req.cookies);
    const cookieUpdated = cookiePrefs.updatedAt ?? null;
    const dbUpdated = dbPrefs.updatedAt ?? null;

    const dbIsNewer =
      dbUpdated && (!cookieUpdated || (cookieUpdated && dbUpdated.getTime() > cookieUpdated.getTime()));
    if (!dbIsNewer) return;

    if (dbPrefs.contrast) {
      res.cookies.set({
        name: CONTRAST_COOKIE,
        value: dbPrefs.contrast,
        ...COOKIE_BASE_OPTIONS,
      });
    }
    if (dbPrefs.fontSize) {
      res.cookies.set({
        name: FONT_SIZE_COOKIE,
        value: dbPrefs.fontSize,
        ...COOKIE_BASE_OPTIONS,
      });
    }
    if (dbPrefs.motion) {
      res.cookies.set({
        name: MOTION_COOKIE,
        value: dbPrefs.motion,
        ...COOKIE_BASE_OPTIONS,
      });
    }
    res.cookies.set({
      name: UPDATED_AT_COOKIE,
      value: dbPrefs.updatedAt.toISOString(),
      ...COOKIE_BASE_OPTIONS,
    });
  } catch (err) {
    console.error("Preference cookie sync failed", err);
  }
}

// 🔧 Millistele teedele proxy rakendub
export const config = {
  // NB: ei püüa "/"
  matcher: [
    "/(et|en|ru)/:path*", // keelesegmendiga lehed
    "/admin/:path*",      // kaitstud
    "/profiil/:path*",    // kaitstud
    "/vestlus/:path*",    // kaitstud
  ],
};
