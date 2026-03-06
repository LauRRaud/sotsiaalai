import { normalizeMunicipalitySearchText } from "./municipalityData.js";

function getGeocodingProviderName() {
  return String(process.env.HELP_GEOCODER_PROVIDER || process.env.GEOCODER_PROVIDER || "none")
    .trim()
    .toLowerCase();
}

function createTimeoutSignal(timeoutMs = 4000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    try {
      controller.abort();
    } catch {}
  }, Math.max(500, Number(timeoutMs) || 4000));
  return {
    signal: controller.signal,
    dispose: () => clearTimeout(timeout)
  };
}

function normalizeCandidateStrings(value = "") {
  return Array.from(
    new Set(
      String(value || "")
        .split(/[|,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function buildNominatimUrl(rawPlace, options = {}) {
  const baseUrl = String(process.env.HELP_GEOCODER_BASE_URL || "https://nominatim.openstreetmap.org")
    .replace(/\/+$/, "");
  const url = new URL("/search", baseUrl);
  url.searchParams.set("q", rawPlace);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(Math.max(1, Math.min(5, Number(options?.limit) || 3))));

  const countrycodes = String(process.env.HELP_GEOCODER_COUNTRY_CODES || "ee").trim();
  if (countrycodes) {
    url.searchParams.set("countrycodes", countrycodes);
  }

  return url;
}

function normalizeNominatimResult(item, rawPlace) {
  if (!item || typeof item !== "object") return null;

  const address = item.address && typeof item.address === "object" ? item.address : {};
  const candidateStrings = [
    address.municipality,
    address.city,
    address.town,
    address.city_district,
    address.suburb,
    address.village,
    address.county,
    item.display_name
  ]
    .flatMap((value) => normalizeCandidateStrings(value))
    .filter(Boolean);

  return {
    provider: "nominatim",
    rawPlace,
    matchedPlace: String(item.display_name || "").trim() || rawPlace,
    municipalityDisplayName: String(address.municipality || address.city || address.town || "").trim() || null,
    county: String(address.county || "").trim() || null,
    confidence: candidateStrings.length ? "medium" : "low",
    latitude: Number.isFinite(Number(item.lat)) ? Number(item.lat) : null,
    longitude: Number.isFinite(Number(item.lon)) ? Number(item.lon) : null,
    candidateStrings
  };
}

async function geocodeWithNominatim(rawPlace, options = {}) {
  const timeout = createTimeoutSignal(options?.timeoutMs);
  try {
    const response = await fetch(buildNominatimUrl(rawPlace, options), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": String(process.env.HELP_GEOCODER_USER_AGENT || "SotsiaalAI/1.0")
      },
      cache: "no-store",
      signal: timeout.signal
    });
    if (!response.ok) return null;

    const payload = await response.json().catch(() => null);
    const first = Array.isArray(payload) ? payload[0] : null;
    return normalizeNominatimResult(first, rawPlace);
  } catch {
    return null;
  } finally {
    timeout.dispose();
  }
}

export async function geocodePlace(rawPlace, options = {}) {
  const query = String(rawPlace || "").trim();
  if (!query) return null;

  const provider = String(options?.provider || getGeocodingProviderName()).trim().toLowerCase();
  if (!provider || provider === "none" || provider === "disabled") {
    return null;
  }
  if (provider === "nominatim") {
    return geocodeWithNominatim(query, options);
  }

  return null;
}

export function normalizeGeocodingCandidateText(value = "") {
  return normalizeMunicipalitySearchText(value);
}
