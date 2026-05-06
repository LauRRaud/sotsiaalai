import { getServerSession } from "next-auth";

import { authConfig } from "@/auth";
import { errorJson, json, localeFromRequest } from "@/lib/documents/server";
import { listPublishedServiceMapEntries } from "@/lib/serviceProviderProfiles";
import { safeError } from "@/lib/privacy/safeError";
import { isAdmin } from "@/lib/authz";
import { readServiceMapEntriesQuery } from "@/lib/serviceMap/entriesQueryPolicy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const locale = localeFromRequest(request);

  try {
    const session = await getServerSession(authConfig).catch(() => null);
    const entries = await listPublishedServiceMapEntries(readServiceMapEntriesQuery(request, {
      canPreviewReviewEntries: isAdmin(session?.user)
    }));
    return json({
      ok: true,
      entries
    });
  } catch (error) {
    console.error("[service-map] entries load failed", safeError(error));
    return errorJson("service_map.errors.load_failed", 500, locale);
  }
}
