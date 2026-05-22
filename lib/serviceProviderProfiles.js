import { prisma } from "@/lib/prisma";
import { serviceMapEntryTypesFromFilter } from "@/lib/serviceMap/entryTypes";
import { buildRagHeaders, deleteRagDocument, ragServiceRequest } from "@/lib/documents/ragService";
import { RAG_SERVICE_KEY } from "@/lib/server/ragAuth";

export { SERVICE_MAP_ENTRY_TYPES } from "@/lib/serviceMap/entryTypes";

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
const MAX_SERVICE_ITEMS = 40;
const SERVICE_PROVIDER_RAG_COLLECTION_ID = process.env.SERVICE_PROVIDER_RAG_COLLECTION_ID || "service_provider_profiles";

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

function normalizeOptionalBoolean(value) {
  if (value === null || typeof value === "undefined" || String(value).trim() === "") return null;
  return normalizeBoolean(value);
}

function normalizeEnum(value, values, fallback) {
  const normalized = String(value || "").trim().toUpperCase();
  return values.includes(normalized) ? normalized : fallback;
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function uniqueList(values = []) {
  const out = [];
  const seen = new Set();
  for (const value of values) {
    const normalized = normalizeText(value, MAX_LIST_ITEM_LENGTH);
    if (!normalized) continue;
    const key = normalized.toLocaleLowerCase("et");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function normalizeComparableText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("et")
    .replace(/\s+/g, " ")
    .trim();
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

function normalizeSelectedServiceMapLocation(input = {}) {
  const latitude = normalizeNumber(input.latitude);
  const longitude = normalizeNumber(input.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    normalizedAddress: normalizeText(input.normalizedAddress || input.address),
    latitude,
    longitude,
    adsObjectId: normalizeText(input.adsObjectId),
    provider: normalizeText(input.geocodingProvider || input.provider) || "maaruum"
  };
}

function buildServiceProviderProfileRagDocId(profile = {}) {
  return `service-provider-profile::${profile.id}`;
}

function serviceProviderProfileRagText(profile = {}) {
  const serviceRows = (profile.serviceItems || [])
    .filter((service) => String(service?.status || "PUBLISHED").toUpperCase() === "PUBLISHED")
    .map((service, index) => [
      `Teenus ${index + 1}: ${service.name}`,
      service.description ? `Kirjeldus: ${service.description}` : null,
      service.category ? `Kategooria: ${service.category}` : null,
      service.targetGroups?.length ? `Sihtrühmad: ${service.targetGroups.join(", ")}` : null,
      service.serviceArea ? `Teeninduspiirkond: ${service.serviceArea}` : null,
      service.feeType ? `Hind: ${service.feeType}` : null,
      service.priceDescription ? `Hinna täpsustus: ${service.priceDescription}` : null,
      service.contactName ? `Kontaktisik: ${service.contactName}` : null,
      service.phone ? `Telefon: ${service.phone}` : null,
      service.email ? `E-post: ${service.email}` : null,
      service.website ? `Veeb: ${service.website}` : null
    ].filter(Boolean).join("\n"))
    .join("\n\n");

  return [
    `Teenuseosutaja: ${profile.organizationName}`,
    profile.shortDescription ? `Kirjeldus: ${profile.shortDescription}` : null,
    profile.serviceCategories?.length ? `Kategooriad: ${profile.serviceCategories.join(", ")}` : null,
    profile.targetGroups?.length ? `Sihtrühmad: ${profile.targetGroups.join(", ")}` : null,
    profile.serviceArea ? `Teeninduspiirkond: ${profile.serviceArea}` : null,
    profile.serviceAreaMunicipalityIds?.length ? `KOV-id või piirkonnad: ${profile.serviceAreaMunicipalityIds.join(", ")}` : null,
    profile.county ? `Maakond: ${profile.county}` : null,
    profile.address ? `Aadress või vastuvõtukoht: ${profile.address}` : null,
    profile.phone ? `Telefon: ${profile.phone}` : null,
    profile.email ? `E-post: ${profile.email}` : null,
    profile.website ? `Veeb: ${profile.website}` : null,
    profile.languages?.length ? `Keeled: ${profile.languages.join(", ")}` : null,
    profile.accessibilityInfo ? `Ligipääsetavus: ${profile.accessibilityInfo}` : null,
    profile.feeType ? `Üldine hinnastus: ${profile.feeType}` : null,
    serviceRows ? `\nTeenused:\n${serviceRows}` : null
  ].filter(Boolean).join("\n");
}

function serviceProviderProfileRagMetadata(profile = {}, ragDocId = "") {
  return {
    doc_id: ragDocId,
    title: profile.organizationName,
    organization_name: profile.organizationName,
    organization_id: profile.id,
    organization_slug: profile.publicSlug,
    organization_type: "service_provider",
    source_type: "organization_profile",
    resource_type: "organization_profile",
    collection_id: SERVICE_PROVIDER_RAG_COLLECTION_ID,
    source_url: profile.website || null,
    contact_phone: profile.phone || null,
    contact_email: profile.email || null,
    contact_address: profile.normalizedAddress || profile.address || null,
    county: profile.county || null,
    service_area: profile.serviceArea || null,
    services: (profile.serviceItems || []).map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      target_groups: service.targetGroups || [],
      service_area: service.serviceArea,
      fee_type: service.feeType,
      price_description: service.priceDescription,
      map_visible: service.mapVisible,
      status: service.status
    })),
    service_count: (profile.serviceItems || []).length,
    last_checked: profile.checkedAt || profile.updatedAt || new Date().toISOString(),
    language: "et"
  };
}

async function syncServiceProviderProfileToRag(profile = {}) {
  const ragDocId = buildServiceProviderProfileRagDocId(profile);
  const shouldPublish = String(profile.status || "").toUpperCase() === "PUBLISHED";

  if (!RAG_SERVICE_KEY) {
    return prisma.serviceProviderProfile.update({
      where: { id: profile.id },
      data: {
        ragMetadata: {
          syncStatus: "skipped",
          reason: "rag_key_missing",
          checkedAt: new Date().toISOString()
        }
      },
      include: {
        serviceMapEntry: true,
        serviceItems: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
        }
      }
    });
  }

  if (!shouldPublish) {
    if (profile.ragSourceId) {
      await deleteRagDocument(profile.ragSourceId, {
        route: "service-provider/profile",
        stage: "rag_delete",
        userId: profile.ownerId
      });
    }
    return prisma.serviceProviderProfile.update({
      where: { id: profile.id },
      data: {
        ragSourceId: null,
        ragMetadata: {
          syncStatus: "removed",
          reason: "profile_not_published",
          checkedAt: new Date().toISOString()
        }
      },
      include: {
        serviceMapEntry: true,
        serviceItems: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
        }
      }
    });
  }

  const metadata = serviceProviderProfileRagMetadata(profile, ragDocId);
  const response = await ragServiceRequest(
    "/ingest/text",
    {
      method: "POST",
      headers: buildRagHeaders("application/json", {
        route: "service-provider/profile",
        stage: "rag_ingest",
        userId: profile.ownerId
      }),
      body: JSON.stringify({
        doc_id: ragDocId,
        text: serviceProviderProfileRagText(profile),
        metadata
      })
    },
    "service_provider_profile.errors.rag_sync_failed"
  );

  return prisma.serviceProviderProfile.update({
    where: { id: profile.id },
    data: {
      ragSourceId: ragDocId,
      ragMetadata: {
        ...metadata,
        syncStatus: "synced",
        inserted: response?.inserted ?? null,
        checkedAt: new Date().toISOString()
      }
    },
    include: {
      serviceMapEntry: true,
      serviceItems: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      }
    }
  });
}

function hasAddressChanged(profile, currentEntry) {
  const nextAddress = normalizeComparableText(profile?.normalizedAddress || profile?.address);
  const previousAddress = normalizeComparableText(currentEntry?.normalizedAddress || currentEntry?.address);
  return nextAddress !== previousAddress;
}

function serviceMapLocationPatch(profile, currentEntry, selectedLocation, now) {
  const address = normalizeText(profile?.address);
  if (selectedLocation) {
    return {
      normalizedAddress: selectedLocation.normalizedAddress || profile.normalizedAddress || address,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      adsObjectId: selectedLocation.adsObjectId,
      geocodingStatus: "MATCHED",
      geocodingRaw: {
        provider: selectedLocation.provider,
        rawAddress: address,
        result: {
          normalizedAddress: selectedLocation.normalizedAddress,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          adsObjectId: selectedLocation.adsObjectId
        },
        checkedAt: now.toISOString(),
        source: "service_provider_profile_address_suggestion"
      }
    };
  }

  if (hasAddressChanged(profile, currentEntry)) {
    return {
      normalizedAddress: profile.normalizedAddress || address,
      latitude: null,
      longitude: null,
      adsObjectId: null,
      geocodingStatus: address ? "PENDING" : "FAILED",
      geocodingRaw: null
    };
  }

  return {
    normalizedAddress: profile.normalizedAddress || currentEntry?.normalizedAddress || address,
    latitude: currentEntry?.latitude ?? null,
    longitude: currentEntry?.longitude ?? null,
    adsObjectId: currentEntry?.adsObjectId || null,
    geocodingStatus: currentEntry?.geocodingStatus || (address ? "PENDING" : "FAILED"),
    geocodingRaw: currentEntry?.geocodingRaw || null
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

export function normalizeServiceProviderServiceInput(input = {}, index = 0, profileDefaults = {}) {
  const name = normalizeText(input.name || input.title, MAX_SHORT_TEXT_LENGTH);
  if (!name) return null;

  return {
    name,
    description: normalizeText(input.description, MAX_TEXT_LENGTH),
    category: normalizeText(input.category || input.serviceCategory, MAX_SHORT_TEXT_LENGTH),
    targetGroups: normalizeList(input.targetGroups),
    serviceArea: normalizeText(input.serviceArea, MAX_TEXT_LENGTH),
    feeType: normalizeEnum(input.feeType || input.priceType, SERVICE_PROVIDER_FEE_TYPES, profileDefaults.feeType || "UNKNOWN"),
    priceDescription: normalizeText(input.priceDescription || input.priceInfo, MAX_TEXT_LENGTH),
    contactName: normalizeText(input.contactName),
    phone: normalizeText(input.phone),
    email: normalizeText(input.email)?.toLowerCase() || null,
    website: normalizeText(input.website),
    acceptsPlatformPreInquiries: normalizeOptionalBoolean(input.acceptsPlatformPreInquiries),
    acceptsEmailPreInquiries: normalizeOptionalBoolean(input.acceptsEmailPreInquiries),
    mapVisible: typeof input.mapVisible === "undefined" ? true : normalizeBoolean(input.mapVisible),
    status: normalizeEnum(input.status, SERVICE_PROVIDER_PROFILE_STATUSES, profileDefaults.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT"),
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Math.max(0, Math.floor(Number(input.sortOrder))) : index
  };
}

export function normalizeServiceProviderServicesInput(input = {}, profileDefaults = {}) {
  const rawItems = Array.isArray(input.serviceItems)
    ? input.serviceItems
    : Array.isArray(input.servicesDetailed)
      ? input.servicesDetailed
      : [];

  const items = rawItems
    .slice(0, MAX_SERVICE_ITEMS)
    .map((item, index) => normalizeServiceProviderServiceInput(item, index, profileDefaults))
    .filter(Boolean);

  if (items.length) return items;

  return normalizeList(input.services)
    .slice(0, MAX_SERVICE_ITEMS)
    .map((name, index) => normalizeServiceProviderServiceInput({
      name,
      feeType: profileDefaults.feeType,
      status: profileDefaults.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      sortOrder: index
    }, index, profileDefaults))
    .filter(Boolean);
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
    serviceMapEntry: serializeServiceMapEntry(profile.serviceMapEntry),
    serviceItems: Array.isArray(profile.serviceItems)
      ? profile.serviceItems.map((item) => ({
          id: item.id,
          providerProfileId: item.providerProfileId,
          name: item.name,
          description: item.description,
          category: item.category,
          targetGroups: item.targetGroups || [],
          serviceArea: item.serviceArea,
          feeType: item.feeType,
          priceDescription: item.priceDescription,
          contactName: item.contactName,
          phone: item.phone,
          email: item.email,
          website: item.website,
          acceptsPlatformPreInquiries: item.acceptsPlatformPreInquiries,
          acceptsEmailPreInquiries: item.acceptsEmailPreInquiries,
          mapVisible: item.mapVisible,
          status: item.status,
          sortOrder: item.sortOrder,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }))
      : []
  };
}

export async function getServiceProviderProfileForOwner(ownerId) {
  if (!ownerId) return null;
  return prisma.serviceProviderProfile.findUnique({
    where: { ownerId },
    include: {
      serviceMapEntry: true,
      serviceItems: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      }
    }
  });
}

export async function upsertServiceProviderProfileForOwner(ownerId, input) {
  if (!ownerId) {
    const error = new Error("api.common.unauthorized");
    error.status = 401;
    throw error;
  }

  const normalizedBase = normalizeServiceProviderProfileInput(input);
  const serviceItems = normalizeServiceProviderServicesInput(input, normalizedBase);
  const normalized = {
    ...normalizedBase,
    services: uniqueList([
      ...normalizedBase.services,
      ...serviceItems.map((item) => item.name)
    ])
  };
  const selectedLocation = normalizeSelectedServiceMapLocation(input);
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

  const savedProfile = await prisma.$transaction(async (tx) => {
    const profile = await tx.serviceProviderProfile.upsert({
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

    await tx.serviceProviderService.deleteMany({
      where: { providerProfileId: profile.id }
    });
    if (serviceItems.length) {
      await tx.serviceProviderService.createMany({
        data: serviceItems.map((item) => ({
          ...item,
          providerProfileId: profile.id
        }))
      });
    }

    const locationPatch = serviceMapLocationPatch(profile, profile.serviceMapEntry, selectedLocation, now);
    const mapState = deriveServiceMapState(profile, {
      ...profile.serviceMapEntry,
      ...locationPatch
    });
    await tx.serviceMapEntry.upsert({
      where: { providerProfileId: profile.id },
      create: {
        providerProfileId: profile.id,
        type: "SERVICE_PROVIDER",
        title: profile.organizationName,
        description: profile.shortDescription,
        county: profile.county,
        address: profile.address,
        normalizedAddress: locationPatch.normalizedAddress,
        phone: profile.phone,
        email: profile.email,
        website: profile.website,
        checkedAt: now,
        status: mapState.status,
        geocodingStatus: mapState.geocodingStatus,
        latitude: locationPatch.latitude,
        longitude: locationPatch.longitude,
        adsObjectId: locationPatch.adsObjectId,
        geocodingRaw: locationPatch.geocodingRaw
      },
      update: {
        title: profile.organizationName,
        description: profile.shortDescription,
        county: profile.county,
        address: profile.address,
        normalizedAddress: locationPatch.normalizedAddress,
        phone: profile.phone,
        email: profile.email,
        website: profile.website,
        checkedAt: now,
        status: mapState.status,
        geocodingStatus: mapState.geocodingStatus,
        latitude: locationPatch.latitude,
        longitude: locationPatch.longitude,
        adsObjectId: locationPatch.adsObjectId,
        geocodingRaw: locationPatch.geocodingRaw
      }
    });

    return tx.serviceProviderProfile.findUnique({
      where: { id: profile.id },
      include: {
        serviceMapEntry: true,
        serviceItems: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
        }
      }
    });
  });

  try {
    return await syncServiceProviderProfileToRag(savedProfile);
  } catch (error) {
    console.error("[service-provider-profile] RAG sync failed", {
      profileId: savedProfile?.id,
      error: error?.message || String(error)
    });
    return prisma.serviceProviderProfile.update({
      where: { id: savedProfile.id },
      data: {
        ragMetadata: {
          syncStatus: "failed",
          message: String(error?.message || error),
          checkedAt: new Date().toISOString()
        }
      },
      include: {
        serviceMapEntry: true,
        serviceItems: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
        }
      }
    });
  }
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

  const normalizedTypes = serviceMapEntryTypesFromFilter(type);
  if (normalizedTypes.length === 1) {
    filters.type = normalizedTypes[0];
  } else if (normalizedTypes.length > 1) {
    filters.type = { in: normalizedTypes };
  }

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
      { providerProfile: { is: { targetGroups: { has: normalizedKeyword } } } },
      { providerProfile: { is: { serviceItems: { some: { mapVisible: true, status: "PUBLISHED", name: { contains: normalizedKeyword, mode: "insensitive" } } } } } },
      { providerProfile: { is: { serviceItems: { some: { mapVisible: true, status: "PUBLISHED", description: { contains: normalizedKeyword, mode: "insensitive" } } } } } },
      { providerProfile: { is: { serviceItems: { some: { mapVisible: true, status: "PUBLISHED", category: { contains: normalizedKeyword, mode: "insensitive" } } } } } },
      { providerProfile: { is: { serviceItems: { some: { mapVisible: true, status: "PUBLISHED", targetGroups: { has: normalizedKeyword } } } } } }
    ];
  }

  const take = Math.max(1, Math.min(Number(limit) || 200, 2000));
  const entries = await prisma.serviceMapEntry.findMany({
    where: filters,
    take,
    orderBy: [{ type: "asc" }, { title: "asc" }],
    include: {
      providerProfile: {
        include: {
          serviceItems: {
            where: {
              mapVisible: true,
              status: "PUBLISHED"
            },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
          }
        }
      },
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
          serviceItems: (entry.providerProfile.serviceItems || []).map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            targetGroups: item.targetGroups || [],
            serviceArea: item.serviceArea,
            feeType: item.feeType,
            priceDescription: item.priceDescription,
            contactName: item.contactName,
            phone: item.phone,
            email: item.email,
            website: item.website,
            acceptsPlatformPreInquiries: item.acceptsPlatformPreInquiries,
            acceptsEmailPreInquiries: item.acceptsEmailPreInquiries,
            mapVisible: item.mapVisible,
            status: item.status,
            sortOrder: item.sortOrder
          })),
          publicSlug: entry.providerProfile.publicSlug
        }
      : null,
    municipality: entry.municipality || null
  }));
}
