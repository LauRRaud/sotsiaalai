import { errorJson, json, localeFromRequest } from "@/lib/documents/server";
import { listPublishedServiceMapEntries } from "@/lib/serviceProviderProfiles";
import { safeError } from "@/lib/privacy/safeError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function readQuery(request) {
  const url = new URL(request.url);
  return {
    keyword: url.searchParams.get("q") || url.searchParams.get("keyword") || "",
    municipalityId: url.searchParams.get("municipalityId") || "",
    municipalityName: url.searchParams.get("municipality") || url.searchParams.get("municipalityName") || "",
    county: url.searchParams.get("county") || "",
    type: url.searchParams.get("type") || "",
    includeUnlocated: url.searchParams.get("includeUnlocated") === "1",
    includeNeedsReview: url.searchParams.get("includeNeedsReview") === "1",
    limit: url.searchParams.get("limit") || ""
  };
}

export async function GET(request) {
  const locale = localeFromRequest(request);

  try {
    const entries = await listPublishedServiceMapEntries(readQuery(request));
    return json({
      ok: true,
      entries
    });
  } catch (error) {
    console.error("[service-map] entries load failed", safeError(error));
    return errorJson("service_map.errors.load_failed", 500, locale);
  }
}
