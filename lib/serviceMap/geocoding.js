import fs from "node:fs/promises";
import path from "node:path";
import { prisma as defaultPrisma } from "../prisma.js";

const DEFAULT_LIMIT = 100;
const DEFAULT_TIMEOUT_MS = 5000;
const GEOCODABLE_STATUSES = ["PENDING"];
const ESTONIA_BOUNDS = Object.freeze({
  minLatitude: 57.2,
  maxLatitude: 59.9,
  minLongitude: 21.4,
  maxLongitude: 28.4
});

function clean(value) {
  const normalized = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  return normalized || null;
}

function addressKey(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("et")
    .replace(/[.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function hasCoordinates(candidate) {
  const latitude = numberOrNull(candidate?.latitude ?? candidate?.lat);
  const longitude = numberOrNull(candidate?.longitude ?? candidate?.lon ?? candidate?.lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  return (
    latitude >= ESTONIA_BOUNDS.minLatitude &&
    latitude <= ESTONIA_BOUNDS.maxLatitude &&
    longitude >= ESTONIA_BOUNDS.minLongitude &&
    longitude <= ESTONIA_BOUNDS.maxLongitude
  );
}

function createTimeoutSignal(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    try {
      controller.abort();
    } catch {}
  }, Math.max(500, Number(timeoutMs) || DEFAULT_TIMEOUT_MS));
  return {
    signal: controller.signal,
    dispose: () => clearTimeout(timeout)
  };
}

function providerList(options = {}) {
  const raw = String(
    options.provider ||
      process.env.SERVICE_MAP_GEOCODER_PROVIDER ||
      process.env.GEOCODER_PROVIDER ||
      "none"
  )
    .trim()
    .toLowerCase();
  if (!raw || raw === "none" || raw === "disabled" || raw === "off") return [];
  return raw
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeCandidate(candidate, provider, rawAddress) {
  if (!candidate || typeof candidate !== "object" || !hasCoordinates(candidate)) return null;
  const latitude = numberOrNull(candidate.latitude ?? candidate.lat);
  const longitude = numberOrNull(candidate.longitude ?? candidate.lon ?? candidate.lng);
  return {
    provider,
    rawAddress,
    normalizedAddress:
      clean(candidate.normalizedAddress || candidate.normalized_address || candidate.address || candidate.display_name) ||
      rawAddress,
    latitude,
    longitude,
    adsObjectId: clean(candidate.adsObjectId || candidate.ads_object_id || candidate.place_id || candidate.osm_id),
    confidence: clean(candidate.confidence) || "medium",
    raw: candidate
  };
}

function resultFromCandidates(candidates, provider, rawAddress, rawPayload = null) {
  const validCandidates = candidates
    .map((candidate) => normalizeCandidate(candidate, provider, rawAddress))
    .filter(Boolean);

  if (validCandidates.length === 0) {
    return {
      status: "FAILED",
      provider,
      rawAddress,
      normalizedAddress: rawAddress,
      latitude: null,
      longitude: null,
      adsObjectId: null,
      raw: rawPayload || candidates
    };
  }

  if (validCandidates.length > 1) {
    return {
      status: "AMBIGUOUS",
      provider,
      rawAddress,
      normalizedAddress: rawAddress,
      latitude: null,
      longitude: null,
      adsObjectId: null,
      raw: {
        candidates: validCandidates.map((candidate) => ({
          normalizedAddress: candidate.normalizedAddress,
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          adsObjectId: candidate.adsObjectId,
          confidence: candidate.confidence
        })),
        payload: rawPayload
      }
    };
  }

  const [candidate] = validCandidates;
  return {
    status: "MATCHED",
    provider,
    rawAddress,
    normalizedAddress: candidate.normalizedAddress,
    latitude: candidate.latitude,
    longitude: candidate.longitude,
    adsObjectId: candidate.adsObjectId,
    raw: candidate.raw
  };
}

async function loadFixtureJson() {
  const inline = clean(process.env.SERVICE_MAP_GEOCODER_FIXTURES);
  if (inline) {
    return JSON.parse(inline);
  }

  const fixtureFile = clean(process.env.SERVICE_MAP_GEOCODER_FIXTURE_FILE);
  if (!fixtureFile) return null;

  const filePath = path.isAbsolute(fixtureFile)
    ? fixtureFile
    : path.resolve(process.cwd(), fixtureFile);
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text);
}

function fixtureCandidatesForAddress(fixtures, rawAddress) {
  if (!fixtures) return [];
  const key = addressKey(rawAddress);

  if (Array.isArray(fixtures)) {
    return fixtures.filter((item) => addressKey(item?.address || item?.rawAddress || item?.query) === key);
  }

  if (typeof fixtures !== "object") return [];
  const direct = fixtures[rawAddress] || fixtures[key];
  if (!direct) return [];
  if (Array.isArray(direct)) return direct;
  if (Array.isArray(direct.matches)) return direct.matches;
  return [direct];
}

async function geocodeWithFixtures(rawAddress) {
  const fixtures = await loadFixtureJson();
  const candidates = fixtureCandidatesForAddress(fixtures, rawAddress);
  return resultFromCandidates(candidates, "fixture", rawAddress, candidates);
}

function buildNominatimUrl(rawAddress, options = {}) {
  const baseUrl = String(
    process.env.SERVICE_MAP_GEOCODER_BASE_URL ||
      process.env.HELP_GEOCODER_BASE_URL ||
      "https://nominatim.openstreetmap.org"
  ).replace(/\/+$/, "");
  const url = new URL("/search", baseUrl);
  url.searchParams.set("q", rawAddress);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(Math.max(1, Math.min(10, Number(options.limit) || 5))));

  const countrycodes = clean(
    process.env.SERVICE_MAP_GEOCODER_COUNTRY_CODES || process.env.HELP_GEOCODER_COUNTRY_CODES || "ee"
  );
  if (countrycodes) url.searchParams.set("countrycodes", countrycodes);

  return url;
}

async function geocodeWithNominatim(rawAddress, options = {}) {
  const timeout = createTimeoutSignal(options.timeoutMs);
  try {
    const response = await fetch(buildNominatimUrl(rawAddress, options), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": String(
          process.env.SERVICE_MAP_GEOCODER_USER_AGENT ||
            process.env.HELP_GEOCODER_USER_AGENT ||
            "SotsiaalAI/1.0"
        )
      },
      cache: "no-store",
      signal: timeout.signal
    });
    if (!response.ok) {
      return {
        status: "FAILED",
        provider: "nominatim",
        rawAddress,
        normalizedAddress: rawAddress,
        latitude: null,
        longitude: null,
        adsObjectId: null,
        raw: { httpStatus: response.status }
      };
    }

    const payload = await response.json().catch(() => []);
    const items = Array.isArray(payload) ? payload : [];
    const candidates = items.map((item) => ({
      ...item,
      normalizedAddress: item.display_name,
      latitude: item.lat,
      longitude: item.lon,
      adsObjectId: item.place_id || item.osm_id
    }));
    return resultFromCandidates(candidates, "nominatim", rawAddress, payload);
  } catch (error) {
    return {
      status: "FAILED",
      provider: "nominatim",
      rawAddress,
      normalizedAddress: rawAddress,
      latitude: null,
      longitude: null,
      adsObjectId: null,
      raw: { error: error?.name || "geocoding_error" }
    };
  } finally {
    timeout.dispose();
  }
}

export async function geocodeServiceMapAddress(rawAddress, options = {}) {
  const address = clean(rawAddress);
  if (!address) {
    return {
      status: "FAILED",
      provider: "none",
      rawAddress: null,
      normalizedAddress: null,
      latitude: null,
      longitude: null,
      adsObjectId: null,
      raw: { reason: "missing_address" }
    };
  }

  const providers = providerList(options);
  if (providers.length === 0) {
    return {
      status: "PENDING",
      provider: "none",
      rawAddress: address,
      normalizedAddress: address,
      latitude: null,
      longitude: null,
      adsObjectId: null,
      raw: { reason: "geocoder_not_configured" }
    };
  }

  let lastResult = null;
  for (const provider of providers) {
    if (provider === "fixture" || provider === "fixtures") {
      lastResult = await geocodeWithFixtures(address);
    } else if (provider === "nominatim" || provider === "osm") {
      lastResult = await geocodeWithNominatim(address, options);
    } else {
      lastResult = {
        status: "FAILED",
        provider,
        rawAddress: address,
        normalizedAddress: address,
        latitude: null,
        longitude: null,
        adsObjectId: null,
        raw: { reason: "unsupported_provider" }
      };
    }

    if (lastResult.status !== "FAILED") return lastResult;
  }

  return lastResult;
}

function statusAfterGeocoding(entry, geocoding) {
  if (entry.status === "HIDDEN") return "HIDDEN";
  if (entry.status === "DRAFT") return "DRAFT";
  if (geocoding.status === "MATCHED") return "PUBLISHED";
  if (geocoding.status === "AMBIGUOUS" || geocoding.status === "FAILED") return "NEEDS_REVIEW";
  return entry.status;
}

function geocodingUpdateForEntry(entry, geocoding) {
  return {
    status: statusAfterGeocoding(entry, geocoding),
    geocodingStatus: geocoding.status,
    normalizedAddress: geocoding.normalizedAddress,
    latitude: geocoding.status === "MATCHED" ? geocoding.latitude : null,
    longitude: geocoding.status === "MATCHED" ? geocoding.longitude : null,
    adsObjectId: geocoding.status === "MATCHED" ? geocoding.adsObjectId : null,
    geocodingRaw: {
      provider: geocoding.provider,
      rawAddress: geocoding.rawAddress,
      result: geocoding.raw,
      checkedAt: new Date().toISOString()
    },
    checkedAt: new Date()
  };
}

export async function geocodeServiceMapEntries({
  prisma = defaultPrisma,
  dryRun = false,
  limit = DEFAULT_LIMIT,
  statuses = GEOCODABLE_STATUSES,
  provider,
  timeoutMs
} = {}) {
  const take = Math.max(1, Math.min(Number(limit) || DEFAULT_LIMIT, 500));
  const geocodingStatuses = Array.isArray(statuses) && statuses.length ? statuses : GEOCODABLE_STATUSES;
  const entries = await prisma.serviceMapEntry.findMany({
    where: {
      address: { not: null },
      geocodingStatus: { in: geocodingStatuses }
    },
    take,
    orderBy: [{ updatedAt: "asc" }],
    select: {
      id: true,
      type: true,
      title: true,
      address: true,
      status: true,
      geocodingStatus: true
    }
  });

  const result = {
    scanned: entries.length,
    updated: 0,
    planned: 0,
    matched: 0,
    ambiguous: 0,
    failed: 0,
    pending: 0,
    entries: []
  };

  for (const entry of entries) {
    const geocoding = await geocodeServiceMapAddress(entry.address, { provider, timeoutMs });
    const update = geocodingUpdateForEntry(entry, geocoding);
    const plannedEntry = {
      id: entry.id,
      type: entry.type,
      title: entry.title,
      address: entry.address,
      previousStatus: entry.status,
      previousGeocodingStatus: entry.geocodingStatus,
      nextStatus: update.status,
      nextGeocodingStatus: update.geocodingStatus,
      normalizedAddress: update.normalizedAddress,
      latitude: update.latitude,
      longitude: update.longitude,
      provider: geocoding.provider
    };

    result.entries.push(plannedEntry);
    result.planned += 1;
    if (geocoding.status === "MATCHED") result.matched += 1;
    if (geocoding.status === "AMBIGUOUS") result.ambiguous += 1;
    if (geocoding.status === "FAILED") result.failed += 1;
    if (geocoding.status === "PENDING") result.pending += 1;

    if (dryRun) continue;

    await prisma.serviceMapEntry.update({
      where: { id: entry.id },
      data: update
    });
    result.updated += 1;
  }

  return result;
}

export function isMissingServiceMapEntryTableError(error) {
  const message = String(error?.message || "");
  return error?.code === "P2021" || message.includes("ServiceMapEntry") || message.includes("serviceMapEntry");
}
