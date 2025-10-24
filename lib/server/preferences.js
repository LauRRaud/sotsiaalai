import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AccessibilityContrast,
  AccessibilityFontSize,
  AccessibilityMotion,
} from "@prisma/client";
import {
  readPreferencesFromCookies,
  prismaPreferenceToValues,
  pickLatestPreference,
  LOCALE_COOKIE,
  CONTRAST_COOKIE,
  FONT_SIZE_COOKIE,
  MOTION_COOKIE,
  UPDATED_AT_COOKIE,
  ONBOARDING_DONE_COOKIE,
  COOKIE_BASE_OPTIONS,
  isoTimestamp,
} from "@/lib/preferences";

export async function resolvePreferenceContext(cookieStore) {
  const store = cookieStore ?? (await cookies());
  const cookiePrefs = readPreferencesFromCookies(store);

  try {
    const session = await auth();
    const userId = session?.user?.id ? String(session.user.id) : null;
    if (!userId) {
      return { cookies: cookiePrefs, effective: cookiePrefs };
    }

    const record = await prisma.userPreference.findUnique({
      where: { userId },
      select: { locale: true, contrast: true, fontSize: true, motion: true, updatedAt: true },
    });

    const dbPrefs = prismaPreferenceToValues(record);
    const effective = pickLatestPreference(cookiePrefs, dbPrefs);

    return {
      cookies: cookiePrefs,
      db: dbPrefs,
      effective,
      session,
    };
  } catch (error) {
    console.error("resolvePreferenceContext error", error);
    return { cookies: cookiePrefs, effective: cookiePrefs };
  }
}

export async function upsertUserPreferences(userId, { locale, contrast, fontSize, motion }) {
  if (!userId) return null;

  const contrastEnum = contrast
    ? {
        normal: AccessibilityContrast.NORMAL,
        high: AccessibilityContrast.HIGH,
      }[contrast] ?? AccessibilityContrast.NORMAL
    : AccessibilityContrast.NORMAL;

  const fontSizeEnum = fontSize
    ? {
        md: AccessibilityFontSize.MD,
        lg: AccessibilityFontSize.LG,
        xl: AccessibilityFontSize.XL,
      }[fontSize] ?? AccessibilityFontSize.MD
    : AccessibilityFontSize.MD;

  const motionEnum = motion
    ? {
        normal: AccessibilityMotion.NORMAL,
        reduce: AccessibilityMotion.REDUCE,
      }[motion] ?? AccessibilityMotion.NORMAL
    : AccessibilityMotion.NORMAL;

  const record = await prisma.userPreference.upsert({
    where: { userId },
    create: { userId, locale, contrast: contrastEnum, fontSize: fontSizeEnum, motion: motionEnum },
    update: { locale, contrast: contrastEnum, fontSize: fontSizeEnum, motion: motionEnum },
    select: { locale: true, contrast: true, fontSize: true, motion: true, updatedAt: true },
  });

  return prismaPreferenceToValues(record);
}

export function applyPreferenceCookies(response, preferences, options = {}) {
  if (!response?.cookies || !preferences) return response;

  const {
    locale,
    contrast,
    fontSize,
    motion,
    updatedAt,
  } = preferences;

  const timestamp =
    updatedAt instanceof Date ? updatedAt.toISOString() : isoTimestamp();

  if (locale) {
    response.cookies.set({
      name: LOCALE_COOKIE,
      value: locale,
      ...COOKIE_BASE_OPTIONS,
    });
  }
  if (contrast) {
    response.cookies.set({
      name: CONTRAST_COOKIE,
      value: contrast,
      ...COOKIE_BASE_OPTIONS,
    });
  }
  if (fontSize) {
    response.cookies.set({
      name: FONT_SIZE_COOKIE,
      value: fontSize,
      ...COOKIE_BASE_OPTIONS,
    });
  }
  if (motion) {
    response.cookies.set({
      name: MOTION_COOKIE,
      value: motion,
      ...COOKIE_BASE_OPTIONS,
    });
  }
  response.cookies.set({
    name: UPDATED_AT_COOKIE,
    value: timestamp,
    ...COOKIE_BASE_OPTIONS,
  });

  if (options?.setOnboardingDone !== false) {
    response.cookies.set({
      name: ONBOARDING_DONE_COOKIE,
      value: "true",
      ...COOKIE_BASE_OPTIONS,
    });
  }

  return response;
}
