import { prisma } from "@/lib/prisma";

export const SERVICE_PROVIDER_PROFILE_STATUSES = Object.freeze([
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "HIDDEN"
]);

export const SERVICE_PROVIDER_FEE_TYPES = Object.freeze([
  "FREE",
  "PAID",
  "AGREEMENT",
  "MIXED",
  "UNKNOWN"
]);

export const SERVICE_MAP_ENTRY_TYPES = Object.freeze([
  "KOV_SOCIAL_CONTACT",
  "KOV_GENERAL_CONTACT",
  "SERVICE_PROVIDER"
]);

export const SERVICE_MAP_ENTRY_STATUSES = Object.freeze([
  "DRAFT",
  "NEEDS_REVIEW",
  "PUBLISHED",
  "HIDDEN"
]);

export const SERVICE_MAP_GEOCODING_STATUSES = Object.freeze([
  "PENDING",
  "MATCHED",
  "AMBIGUOUS",
  "FAILED",
  "MANUALLY_CONFIRMED"
]);

const MAX_TEXT_LENGTH = 8_000;
const MAX_SHORT_TEXT_LENGTH = 1_000;
const MAX_LIST_ITEMS = 50;
const MAX_LIST_ITEM_LENGTH = 180;

function normalizeText(value, maxLength = MAX_SHORT_TEXT_LENGTH) {
  const normalized = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function normalizeRequiredText(value, fieldName, maxLength = MAX_SHORT_TEXT_LENGTH) {
  const normalized = normalizeText(value, maxLength);
  if (!normalized) {
    const error = new Error(`service_provider_profile.errors.${fieldName}_required`);
    error.status = 400;
    throw error;
  }
  return normalized;
}

function normalizeList(value) {
  const source = Array.isArray(value)
    ? value
    : String(value || "")
        .split(/[,;\n\r]/)
        .map((part) => part.trim());

  const result = [];
  const seen = new Set();
  for (const item of source) {
    const normalized = normalizeText(item, MAX_LIST_ITEM_LENGTH);
    if (!normalized) continue;
    const key = normalized.toLocaleLowerCase("et");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
    if (result.length >= MAX_LIST_ITEMS) break;
  }
  return result;
}

function normalizeBoolean(value) {
  if (value === true || value === false) return value;
  const normalized = String(value || "").trim().toLowerCase();
  if (["1", "true", "yes", "jah", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "ei", "off"].includes(normalized)) return false;
  return false;
}

function normalizeEnum(value, values, fallback) {
  const normalized = String(value || "").trim().toUpperCase();
  return values.includes(normalized) ? normalized : fallback;
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function buildPublicSlug(organizationName, ownerId) {
  const base = slugify(organizationName) || "teenuseosutaja";
  const suffix = String(ownerId || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
  return suffix ? `${base}-${suffix}` : base;
}

function isConfirmedLocation(entry) {
  const status = String(entry?.geocodingStatus || "").toUpperCase();
  const latitude = Number(entry?.latitude);
  const longitude = Number(entry?.longitude);
  return (
    ["MATCHED", "MANUALLY_CONFIRMED"].includes(status) &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

function deriveServiceMapState(profile, currentEntry) {
  const profileStatus = String(profile?.status || "DRAFT").toUpperCase();
  const mapVisible = Boolean(profile?.mapVisible);
  const address = normalizeText(profile?.address, MAX_SHORT_TEXT_LENGTH);

  if (!mapVisible || profileStatus === "HIDDEN") {
    return {
      status: "HIDDEN",
      geocodingStatus: currentEntry?.geocodingStatus || (address ? "PENDING" : "FAILED")
    };
  }

  if (profileStatus !== "PUBLISHED") {
    return {
      status: "DRAFT",
      geocodingStatus: currentEntry?.geocodingStatus || (address ? "PENDING" : "FAILED")
    };
  }

  if (isConfirmedLocation(currentEntry)) {
    return {
      status: "PUBLISHED",
      geocodingStatus: currentEntry.geocodingStatus
    };
  }

  return {
    status: "NEEDS_REVIEW",
    geocodingStatus: address ? currentEntry?.geocodingStatus || "PENDING" : "FAILED"
  };
}

export function normalizeServiceProviderProfileInput(input = {}) {
  const organizationName = normalizeRequiredText(input.organizationName, "organization_name");
  const status = normalizeEnum(input.status, SERVICE_PROVIDER_PROFILE_STATUSES, "DRAFT");
  const feeType = normalizeEnum(input.feeType, SERVICE_PROVIDER_FEE_TYPES, "UNKNOWN");

  return {
    organizationName,
    shortDescription: normalizeText(input.shortDescription, MAX_TEXT_LENGTH),
    services: normalizeList(input.services),
    serviceCategories: normalizeList(input.serviceCategories),
    targetGroups: normalizeList(input.targetGroups),
    serviceArea: normalizeText(input.serviceArea, MAX_TEXT_LENGTH),
    serviceAreaMunicipalityIds: normalizeList(input.serviceAreaMunicipalityIds),
    county: normalizeText(input.county),
    address: normalizeText(input.address),
    normalizedAddress: normalizeText(input.normalizedAddress),
    phone: normalizeText(input.phone),
    email: normalizeText(input.email)?.toLowerCase() || null,
    website: normalizeText(input.website),
    languages: normalizeList(input.languages),
    accessibilityInfo: normalizeText(input.accessibilityInfo, MAX_TEXT_LENGTH),
    feeType,
    mapVisible: normalizeBoolean(input.mapVisible),
    acceptsPlatformPreInquiries: normalizeBoolean(input.acceptsPlatformPreInquiries),
    acceptsEmailPreInquiries: normalizeBoolean(input.acceptsEmailPreInquiries),
    status
  };
}

export function serializeServiceMapEntry(entry) {
  if (!entry) return null;
  return {
    id: entry.id,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    municipalityId: entry.municipalityId,
    municipalityName: entry.municipalityName,
    county: entry.county,
    address: entry.address,
    normalizedAddress: entry.normalizedAddress,
    phone: entry.phone,
    email: entry.email,
    website: entry.website,
    sourceUrl: entry.sourceUrl,
    sourceDocId: entry.sourceDocId,
    checkedAt: entry.checkedAt,
    providerProfileId: entry.providerProfileId,
    status: entry.status,
    geocodingStatus: entry.geocodingStatus,
    latitude: entry.latitude,
    longitude: entry.longitude,
    adsObjectId: entry.adsObjectId,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  };
}

export function serializeServiceProviderProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    ownerId: profile.ownerId,
    organizationName: profile.organizationName,
    shortDescription: profile.shortDescription,
    services: profile.services || [],
    serviceCategories: profile.serviceCategories || [],
    targetGroups: profile.targetGroups || [],
    serviceArea: profile.serviceArea,
    serviceAreaMunicipalityIds: profile.serviceAreaMunicipalityIds || [],
    county: profile.county,
    address: profile.address,
    normalizedAddress: profile.normalizedAddress,
    phone: profile.phone,
    email: profile.email,
    website: profile.website,
    languages: profile.languages || [],
    accessibilityInfo: profile.accessibilityInfo,
    feeType: profile.feeType,
    mapVisible: profile.mapVisible,
    acceptsPlatformPreInquiries: profile.acceptsPlatformPreInquiries,
    acceptsEmailPreInquiries: profile.acceptsEmailPreInquiries,
    status: profile.status,
    publicSlug: profile.publicSlug,
    publishedAt: profile.publishedAt,
    hiddenAt: profile.hiddenAt,
    checkedAt: profile.checkedAt,
    ragSourceId: profile.ragSourceId,
    ragMetadata: profile.ragMetadata,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    serviceMapEntry: serializeServiceMapEntry(profile.serviceMapEntry)
  };
}

export async function getServiceProviderProfileForOwner(ownerId) {
  if (!ownerId) return null;
  return prisma.serviceProviderProfile.findUnique({
    where: { ownerId },
    include: { serviceMapEntry: true }
  });
}

export async function upsertServiceProviderProfileForOwner(ownerId, input) {
  if (!ownerId) {
    const error = new Error("api.common.unauthorized");
    error.status = 401;
    throw error;
  }

  const normalized = normalizeServiceProviderProfileInput(input);
  const existing = await getServiceProviderProfileForOwner(ownerId);
  const now = new Date();
  const nextPublishedAt =
    normalized.status === "PUBLISHED"
      ? existing?.publishedAt || now
      : existing?.publishedAt || null;
  const nextHiddenAt =
    normalized.status === "HIDDEN"
      ? existing?.hiddenAt || now
      : normalized.status === "PUBLISHED"
        ? null
        : existing?.hiddenAt || null;
  const publicSlug = existing?.publicSlug || buildPublicSlug(normalized.organizationName, ownerId);

  const profile = await prisma.serviceProviderProfile.upsert({
    where: { ownerId },
    create: {
      ownerId,
      ...normalized,
      publicSlug,
      publishedAt: nextPublishedAt,
      hiddenAt: nextHiddenAt,
      checkedAt: now
    },
    update: {
      ...normalized,
      publicSlug,
      publishedAt: nextPublishedAt,
      hiddenAt: nextHiddenAt,
      checkedAt: now
    },
    include: { serviceMapEntry: true }
  });

  const mapState = deriveServiceMapState(profile, profile.serviceMapEntry);
  const serviceMapEntry = await prisma.serviceMapEntry.upsert({
    where: { providerProfileId: profile.id },
    create: {
      providerProfileId: profile.id,
      type: "SERVICE_PROVIDER",
      title: profile.organizationName,
      description: profile.shortDescription,
      county: profile.county,
      address: profile.address,
      normalizedAddress: profile.normalizedAddress,
      phone: profile.phone,
      email: profile.email,
      website: profile.website,
      checkedAt: now,
      status: mapState.status,
      geocodingStatus: mapState.geocodingStatus
    },
    update: {
      title: profile.organizationName,
      description: profile.shortDescription,
      county: profile.county,
      address: profile.address,
      normalizedAddress: profile.normalizedAddress,
      phone: profile.phone,
      email: profile.email,
      website: profile.website,
      checkedAt: now,
      status: mapState.status,
      geocodingStatus: mapState.geocodingStatus
    }
  });

  return {
    ...profile,
    serviceMapEntry
  };
}

export async function listPublishedServiceMapEntries({
  keyword = "",
  municipalityId = "",
  municipalityName = "",
  county = "",
  type = "",
  includeUnlocated = false,
  includeNeedsReview = false,
  limit = 200
} = {}) {
  const filters = {
    status: includeNeedsReview ? { in: ["PUBLISHED", "NEEDS_REVIEW"] } : "PUBLISHED"
  };

  if (!includeUnlocated) {
    filters.geocodingStatus = {
      in: ["MATCHED", "MANUALLY_CONFIRMED"]
    };
    filters.latitude = { not: null };
    filters.longitude = { not: null };
  }

  const normalizedType = normalizeEnum(type, SERVICE_MAP_ENTRY_TYPES, "");
  if (normalizedType) filters.type = normalizedType;

  const normalizedMunicipalityId = normalizeText(municipalityId);
  if (normalizedMunicipalityId) filters.municipalityId = normalizedMunicipalityId;

  const normalizedMunicipalityName = normalizeText(municipalityName);
  if (normalizedMunicipalityName) {
    filters.municipalityName = {
      contains: normalizedMunicipalityName,
      mode: "insensitive"
    };
  }

  const normalizedCounty = normalizeText(county);
  if (normalizedCounty) {
    filters.county = {
      contains: normalizedCounty,
      mode: "insensitive"
    };
  }

  const normalizedKeyword = normalizeText(keyword);
  if (normalizedKeyword) {
    filters.OR = [
      { title: { contains: normalizedKeyword, mode: "insensitive" } },
      { description: { contains: normalizedKeyword, mode: "insensitive" } },
      { address: { contains: normalizedKeyword, mode: "insensitive" } },
      { providerProfile: { is: { services: { has: normalizedKeyword } } } },
      { providerProfile: { is: { serviceCategories: { has: normalizedKeyword } } } },
      { providerProfile: { is: { targetGroups: { has: normalizedKeyword } } } }
    ];
  }

  const take = Math.max(1, Math.min(Number(limit) || 200, 500));
  const entries = await prisma.serviceMapEntry.findMany({
    where: filters,
    take,
    orderBy: [{ type: "asc" }, { title: "asc" }],
    include: {
      providerProfile: true,
      municipality: {
        select: {
          id: true,
          slug: true,
          displayName: true,
          county: true
        }
      }
    }
  });

  return entries.map((entry) => ({
    ...serializeServiceMapEntry(entry),
    providerProfile: entry.providerProfile
      ? {
          id: entry.providerProfile.id,
          organizationName: entry.providerProfile.organizationName,
          shortDescription: entry.providerProfile.shortDescription,
          services: entry.providerProfile.services || [],
          serviceCategories: entry.providerProfile.serviceCategories || [],
          targetGroups: entry.providerProfile.targetGroups || [],
          serviceArea: entry.providerProfile.serviceArea,
          publicSlug: entry.providerProfile.publicSlug
        }
      : null,
    municipality: entry.municipality || null
  }));
}
