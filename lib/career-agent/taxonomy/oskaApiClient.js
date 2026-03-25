// /lib/career-agent/taxonomy/oskaApiClient.js

import { getCareerTaxonomyText } from "../careerText.js";

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_PAGE_SIZE = 100;

export const OSKA_RESOURCE_TYPES = Object.freeze({
  OCCUPATIONS: "occupations",
  SKILLS: "skills",
  FIELDS: "fields",
});

export const DEFAULT_OSKA_ENDPOINTS = Object.freeze({
  [OSKA_RESOURCE_TYPES.OCCUPATIONS]: "/occupations",
  [OSKA_RESOURCE_TYPES.SKILLS]: "/skills",
  [OSKA_RESOURCE_TYPES.FIELDS]: "/fields",
});

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function coerceNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(path, baseUrl);

  for (const [key, rawValue] of Object.entries(query || {})) {
    if (rawValue === null || rawValue === undefined) continue;

    if (Array.isArray(rawValue)) {
      for (const item of rawValue) {
        if (item === null || item === undefined || item === "") continue;
        url.searchParams.append(key, String(item));
      }
      continue;
    }

    if (rawValue === "") continue;
    url.searchParams.set(key, String(rawValue));
  }

  return url;
}

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

function mergeAbortSignals(...signals) {
  const activeSignals = signals.filter(Boolean);
  if (activeSignals.length <= 1) {
    return activeSignals[0] || undefined;
  }

  const controller = new AbortController();

  for (const signal of activeSignals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }

    signal.addEventListener(
      "abort",
      () => {
        controller.abort();
      },
      { once: true }
    );
  }

  return controller.signal;
}

function extractItemsFromPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidates = [
    payload.items,
    payload.results,
    payload.data,
    payload.occupations,
    payload.skills,
    payload.fields,
    payload.records,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function extractPagination(payload, headers) {
  const headerTotal =
    coerceNumber(headers.get("x-total-count")) ??
    coerceNumber(headers.get("x-total")) ??
    null;

  if (!payload || typeof payload !== "object") {
    return {
      total: headerTotal,
      nextPage: null,
      nextCursor: null,
      hasMore: false,
    };
  }

  const total =
    coerceNumber(payload.total) ??
    coerceNumber(payload.count) ??
    coerceNumber(payload.totalCount) ??
    headerTotal;

  const nextPage =
    coerceNumber(payload.nextPage) ??
    coerceNumber(payload.page?.next) ??
    null;

  const nextCursor =
    coerceString(payload.next) ||
    coerceString(payload.nextCursor) ||
    coerceString(payload.cursor?.next) ||
    null;

  const hasMore =
    payload.hasMore === true ||
    payload.has_next === true ||
    Boolean(nextPage) ||
    Boolean(nextCursor);

  return {
    total,
    nextPage,
    nextCursor,
    hasMore,
  };
}

function buildApiError(message, extra = {}) {
  const error = new Error(message);
  Object.assign(error, extra);
  return error;
}

async function parseJsonResponse(response, errorText) {
  const contentType = response.headers.get("content-type") || "";
  const isJsonLike =
    contentType.includes("application/json") ||
    contentType.includes("+json");

  if (!isJsonLike) {
    const responseText = await response.text();
    throw buildApiError(errorText, {
      status: response.status,
      body: responseText,
    });
  }

  return response.json();
}

export function createOskaApiClient(config = {}) {
  const baseUrl = coerceString(config.baseUrl);
  const locale =
    config.locale || config.language || config.documentLanguage || "et";
  const text = getCareerTaxonomyText(locale);
  if (!baseUrl) {
    throw new Error(text.errors.clientRequiresBaseUrl);
  }

  const apiKey = coerceString(config.apiKey);
  const timeoutMs = coerceNumber(config.timeoutMs, DEFAULT_TIMEOUT_MS);
  const defaultPageSize = coerceNumber(config.pageSize, DEFAULT_PAGE_SIZE);
  const endpoints = {
    ...DEFAULT_OSKA_ENDPOINTS,
    ...(config.endpoints || {}),
  };

  async function request(path, options = {}) {
    const {
      method = "GET",
      query,
      headers = {},
      signal,
      body,
    } = options;

    const timeout = createTimeoutSignal(timeoutMs);
    const mergedSignal = mergeAbortSignals(signal, timeout.signal);

    try {
      const url = buildUrl(baseUrl, path, query);

      const response = await fetch(url, {
        method,
        signal: mergedSignal,
        headers: {
          Accept: "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          ...headers,
        },
        body,
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw buildApiError(`${text.errors.requestFailed} ${response.status}.`, {
          status: response.status,
          body: responseText,
          path,
        });
      }

      const payload = await parseJsonResponse(response, text.errors.invalidJson);
      return {
        payload,
        headers: response.headers,
      };
    } finally {
      timeout.clear();
    }
  }

  async function listResource(resourceType, options = {}) {
    const path = endpoints[resourceType];
    if (!path) {
      throw new Error(`${text.errors.missingEndpoint} ${resourceType}`);
    }

    const page = coerceNumber(options.page, 1);
    const limit = coerceNumber(options.limit, defaultPageSize);
    const query = {
      page,
      limit,
      q: coerceString(options.query),
      search: coerceString(options.search),
      ...options.queryParams,
    };

    const { payload, headers } = await request(path, {
      query,
      signal: options.signal,
    });

    const items = extractItemsFromPayload(payload);
    const pagination = extractPagination(payload, headers);

    return {
      resourceType,
      items,
      page,
      limit,
      total: pagination.total,
      hasMore:
        pagination.hasMore ||
        (pagination.total !== null ? page * limit < pagination.total : false),
      nextPage:
        pagination.nextPage ||
        ((pagination.total !== null && page * limit < pagination.total)
          ? page + 1
          : null),
      nextCursor: pagination.nextCursor,
      raw: payload,
    };
  }

  async function fetchAllResourcePages(resourceType, options = {}) {
    const allItems = [];
    const seenKeys = new Set();

    let page = 1;
    let cursor = null;
    let guard = 0;
    const maxPages = coerceNumber(options.maxPages, 100);

    while (guard < maxPages) {
      guard += 1;

      const response = await listResource(resourceType, {
        ...options,
        page: cursor ? undefined : page,
        queryParams: {
          ...(options.queryParams || {}),
          ...(cursor ? { cursor } : {}),
        },
      });

      for (const item of response.items) {
        const dedupeKey =
          coerceString(item?.id) ||
          coerceString(item?.code) ||
          coerceString(item?.uuid) ||
          JSON.stringify(item);

        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);
        allItems.push(item);
      }

      if (!response.hasMore) {
        break;
      }

      if (response.nextCursor) {
        cursor = response.nextCursor;
        continue;
      }

      if (response.nextPage) {
        page = response.nextPage;
        continue;
      }

      break;
    }

    return {
      resourceType,
      items: allItems,
      total: allItems.length,
      fetchedPages: guard,
    };
  }

  async function fetchOccupations(options = {}) {
    return listResource(OSKA_RESOURCE_TYPES.OCCUPATIONS, options);
  }

  async function fetchSkills(options = {}) {
    return listResource(OSKA_RESOURCE_TYPES.SKILLS, options);
  }

  async function fetchFields(options = {}) {
    return listResource(OSKA_RESOURCE_TYPES.FIELDS, options);
  }

  async function fetchAllOccupations(options = {}) {
    return fetchAllResourcePages(OSKA_RESOURCE_TYPES.OCCUPATIONS, options);
  }

  async function fetchAllSkills(options = {}) {
    return fetchAllResourcePages(OSKA_RESOURCE_TYPES.SKILLS, options);
  }

  async function fetchAllFields(options = {}) {
    return fetchAllResourcePages(OSKA_RESOURCE_TYPES.FIELDS, options);
  }

  async function fetchFullTaxonomy(options = {}) {
    const [occupations, skills, fields] = await Promise.all([
      fetchAllOccupations(options),
      fetchAllSkills(options),
      fetchAllFields(options),
    ]);

    return {
      occupations: occupations.items,
      skills: skills.items,
      fields: fields.items,
      meta: {
        occupationCount: occupations.items.length,
        skillCount: skills.items.length,
        fieldCount: fields.items.length,
      },
    };
  }

  async function healthCheck(options = {}) {
    try {
      await fetchOccupations({
        limit: 1,
        signal: options.signal,
      });

      return {
        ok: true,
        baseUrl,
      };
    } catch (error) {
      return {
        ok: false,
        baseUrl,
        error: error instanceof Error ? error.message : text.errors.unknownApiError,
      };
    }
  }

  return {
    baseUrl,
    endpoints,

    request,
    listResource,
    fetchAllResourcePages,

    fetchOccupations,
    fetchSkills,
    fetchFields,

    fetchAllOccupations,
    fetchAllSkills,
    fetchAllFields,

    fetchFullTaxonomy,
    healthCheck,
  };
}

export function createOskaApiClientFromEnv(env = process.env) {
  const baseUrl =
    coerceString(env.OSKA_API_BASE_URL) ||
    coerceString(env.NEXT_PUBLIC_OSKA_API_BASE_URL);

  return createOskaApiClient({
    baseUrl,
    apiKey: coerceString(env.OSKA_API_KEY),
    timeoutMs: coerceNumber(env.OSKA_API_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    pageSize: coerceNumber(env.OSKA_API_PAGE_SIZE, DEFAULT_PAGE_SIZE),
    locale:
      coerceString(env.CAREER_AGENT_LOCALE) ||
      coerceString(env.LANG) ||
      "et",
  });
}
