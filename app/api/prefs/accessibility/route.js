export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeLocale,
  normalizeContrast,
  normalizeFontSize,
  normalizeMotion,
  DEFAULT_PREFERENCES,
  readPreferencesFromCookies,
  prismaPreferenceToValues,
  pickLatestPreference,
} from "@/lib/preferences";
import { applyPreferenceCookies, upsertUserPreferences } from "@/lib/server/preferences";
import { cookies } from "next/headers";

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

function validatePayload(body) {
  const result = {};

  const locale = normalizeLocale(body?.locale);
  if (locale) {
    result.locale = locale;
  }

  const contrast = body?.contrast === undefined ? DEFAULT_PREFERENCES.contrast : normalizeContrast(body?.contrast);
  if (!contrast) {
    return { error: "Kontrasti väärtus on vigane.", field: "contrast" };
  }
  result.contrast = contrast;

  const fontInput = body?.fs ?? body?.fontSize;
  const fontSize =
    fontInput === undefined ? DEFAULT_PREFERENCES.fontSize : normalizeFontSize(fontInput);
  if (!fontSize) {
    return { error: "Kirjasuuruse väärtus on vigane.", field: "fs" };
  }
  result.fontSize = fontSize;

  const motion = body?.motion === undefined ? DEFAULT_PREFERENCES.motion : normalizeMotion(body.motion);
  if (!motion) {
    return { error: "Animatsioonide eelistus on vigane.", field: "motion" };
  }
  result.motion = motion;

  return { value: result };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) {
    return error("Unauthorized", 401);
  }

  const cookieStore = await cookies();
  const cookiePrefs = readPreferencesFromCookies(cookieStore);

  const record = await prisma.userPreference.findUnique({
    where: { userId },
    select: { locale: true, contrast: true, fontSize: true, motion: true, updatedAt: true },
  });
  const dbPrefs = prismaPreferenceToValues(record);
  const effective = pickLatestPreference(cookiePrefs, dbPrefs) ?? cookiePrefs ?? DEFAULT_PREFERENCES;

  return json({
    ok: true,
    preferences: {
      locale: effective.locale ?? cookiePrefs.locale ?? DEFAULT_PREFERENCES.locale,
      contrast: effective.contrast ?? DEFAULT_PREFERENCES.contrast,
      fontSize: effective.fontSize ?? DEFAULT_PREFERENCES.fontSize,
      motion: effective.motion ?? DEFAULT_PREFERENCES.motion,
      updatedAt: effective.updatedAt ?? dbPrefs?.updatedAt ?? cookiePrefs.updatedAt ?? null,
    },
    sources: {
      cookieUpdatedAt: cookiePrefs.updatedAt ?? null,
      dbUpdatedAt: dbPrefs?.updatedAt ?? null,
    },
  });
}

export async function PUT(request) {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) {
    return error("Unauthorized", 401);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const validation = validatePayload(payload);
  if (validation.error) {
    return error(validation.error, 400, { field: validation.field });
  }

  const cookieStore = await cookies();
  const cookiePrefs = readPreferencesFromCookies(cookieStore);
  const record = await prisma.userPreference.findUnique({
    where: { userId },
    select: { locale: true, contrast: true, fontSize: true, motion: true, updatedAt: true },
  });
  const dbPrefs = prismaPreferenceToValues(record);

  const prefsToSave = {
    locale:
      validation.value.locale ??
      dbPrefs?.locale ??
      cookiePrefs.locale ??
      DEFAULT_PREFERENCES.locale,
    contrast: validation.value.contrast,
    fontSize: validation.value.fontSize,
    motion: validation.value.motion,
  };

  try {
    const persisted = await upsertUserPreferences(userId, prefsToSave);
    const responsePayload = persisted ?? { ...prefsToSave, updatedAt: new Date() };
    const response = applyPreferenceCookies(
      json({ ok: true, preferences: responsePayload }),
      {
        ...prefsToSave,
        updatedAt: responsePayload.updatedAt,
      }
    );

    return response;
  } catch (cause) {
    console.error("prefs PUT error", cause);
    return error("Eelistuste salvestamine ebaõnnestus. Palun proovi uuesti.", 500);
  }
}
