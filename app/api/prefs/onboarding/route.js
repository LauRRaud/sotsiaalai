export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  normalizeLocale,
  normalizeContrast,
  normalizeFontSize,
  normalizeMotion,
  sanitizeNextPath,
  buildRedirectPath,
  DEFAULT_PREFERENCES,
} from "@/lib/preferences";
import { applyPreferenceCookies, upsertUserPreferences } from "@/lib/server/preferences";

const RES_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function json(data, status = 200) {
  const response = NextResponse.json(data, { status });
  for (const [key, value] of Object.entries(RES_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

function error(message, status = 400, extras = {}) {
  return json({ ok: false, message, ...extras }, status);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const locale = normalizeLocale(body?.locale ?? body?.lang);
  if (!locale) {
    return error("Vali sobiv keel (et/en/ru).", 400, { field: "locale" });
  }

  const contrast =
    body?.contrast === undefined
      ? DEFAULT_PREFERENCES.contrast
      : normalizeContrast(body.contrast);
  if (!contrast) {
    return error("Kontrasti väärtus on vigane.", 400, { field: "contrast" });
  }

  const fontSizeInput = body?.fs ?? body?.fontSize;
  const fontSize =
    fontSizeInput === undefined ? DEFAULT_PREFERENCES.fontSize : normalizeFontSize(fontSizeInput);
  if (!fontSize) {
    return error("Kirjasuuruse väärtus on vigane.", 400, { field: "fs" });
  }

  const motion =
    body?.motion === undefined
      ? DEFAULT_PREFERENCES.motion
      : normalizeMotion(body.motion);
  if (!motion) {
    return error("Animatsioonide eelistus on vigane.", 400, { field: "motion" });
  }

  const nextPath = sanitizeNextPath(body?.next, request.nextUrl?.origin ?? request.url);
  const redirectPath = buildRedirectPath(locale, nextPath);

  const preferencePayload = {
    locale,
    contrast,
    fontSize,
    motion,
    updatedAt: new Date(),
  };

  try {
    const session = await auth();
    const userId = session?.user?.id ? String(session.user.id) : null;
    if (userId) {
      const persisted = await upsertUserPreferences(userId, {
        locale,
        contrast,
        fontSize,
        motion,
      });
      if (persisted?.updatedAt) {
        preferencePayload.updatedAt = persisted.updatedAt;
      }
    }
  } catch (cause) {
    console.error("onboarding POST persistence skipped", cause);
  }

  const destination = new URL(redirectPath, request.url);
  let response;
  try {
    response = applyPreferenceCookies(
      NextResponse.redirect(destination, { status: 303 }),
      preferencePayload,
    );
  } catch (cause) {
    console.error("onboarding POST cookie apply failed", cause);
    response = NextResponse.redirect(destination, { status: 303 });
  }

  for (const [key, value] of Object.entries(RES_HEADERS)) {
    response.headers.set(key, value);
  }
  response.headers.set("X-Redirect-Path", destination.pathname + destination.search);
  return response;
}
