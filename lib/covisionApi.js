import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { errorJson, localeFromRequest } from "@/lib/documents/server";
import { requireCovisionRole } from "@/lib/covision";
import { safeError } from "@/lib/privacy/safeError";

export async function requireCovisionAuth() {
  const session = await getServerSession(authConfig).catch(() => null);
  return requireCovisionRole(session);
}

export function covisionLocale(request) {
  return localeFromRequest(request);
}

export function covisionErrorResponse(error, locale, context, fallback = "covision.errors.request_failed") {
  const status = Number(error?.status) || 500;
  if (status >= 500 && context) {
    console.error(context, safeError(error));
  }
  return errorJson(error?.message || fallback, status, locale);
}
