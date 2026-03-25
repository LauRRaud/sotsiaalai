// /lib/career-agent/taxonomy/careerTaxonomyService.js

import {
  createOskaApiClient,
  createOskaApiClientFromEnv,
} from "./oskaApiClient.js";
import { getCareerTaxonomyText } from "../careerText.js";
import {
  normalizeOskaDataset,
  buildOskaSearchIndex,
  searchOskaDocuments,
  findBestOccupationMatch,
  findBestSkillMatch,
  findBestFieldMatch,
  getOccupationByCode,
  getSkillByCode,
  getFieldByCode,
} from "./oskaNormalizer.js";

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function coerceNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function coerceBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function nowMs() {
  return Date.now();
}

function buildServiceError(message, extra = {}) {
  const error = new Error(message);
  Object.assign(error, extra);
  return error;
}

function isFreshTimestamp(timestamp, ttlMs) {
  if (!Number.isFinite(timestamp)) return false;
  return nowMs() - timestamp < ttlMs;
}

function createEmptyCacheState() {
  return {
    dataset: null,
    searchIndex: null,
    fetchedAt: null,
    source: null,
    generation: 0,
    loadingPromise: null,
    lastError: null,
  };
}

function makeSnapshot(state, meta = {}) {
  return {
    dataset: state.dataset,
    searchIndex: state.searchIndex,
    fetchedAt: state.fetchedAt,
    source: state.source,
    isFresh: isFreshTimestamp(state.fetchedAt, meta.ttlMs),
    meta: {
      ttlMs: meta.ttlMs,
      returnedFrom: meta.returnedFrom || state.source || null,
      usedStaleFallback: meta.usedStaleFallback === true,
      occupationCount: state.dataset?.meta?.occupationCount ?? 0,
      skillCount: state.dataset?.meta?.skillCount ?? 0,
      fieldCount: state.dataset?.meta?.fieldCount ?? 0,
    },
  };
}

export function createCareerTaxonomyService(config = {}) {
  const ttlMs = coerceNumber(config.ttlMs, DEFAULT_TTL_MS);
  const locale =
    config.locale || config.language || config.documentLanguage || "et";
  const text = getCareerTaxonomyText(locale);
  const client =
    config.client ||
    (config.baseUrl
      ? createOskaApiClient({ ...config, locale })
      : createOskaApiClientFromEnv(config.env || process.env));

  const state = createEmptyCacheState();

  async function refreshTaxonomy(options = {}) {
    const {
      allowStaleOnError = true,
      signal,
    } = options;

    const refreshGeneration = state.generation;
    const hadPreviousData = Boolean(state.dataset && state.searchIndex);

    try {
      const rawTaxonomy = await client.fetchFullTaxonomy({ signal });
      const dataset = normalizeOskaDataset(rawTaxonomy);
      const searchIndex = buildOskaSearchIndex(dataset);

      if (refreshGeneration !== state.generation) {
        return makeSnapshot(state, {
          ttlMs,
          returnedFrom: "discarded_refresh",
          usedStaleFallback: false,
        });
      }

      state.dataset = dataset;
      state.searchIndex = searchIndex;
      state.fetchedAt = nowMs();
      state.source = "network";
      state.lastError = null;

      return makeSnapshot(state, {
        ttlMs,
        returnedFrom: "network",
        usedStaleFallback: false,
      });
    } catch (error) {
      state.lastError =
        error instanceof Error ? error : new Error(text.errors.refreshError);

      if (allowStaleOnError && hadPreviousData) {
        return makeSnapshot(state, {
          ttlMs,
          returnedFrom: "stale_cache",
          usedStaleFallback: true,
        });
      }

      throw buildServiceError(text.errors.refreshFailed, {
        cause: state.lastError,
      });
    }
  }

  async function ensureReady(options = {}) {
    const {
      forceRefresh = false,
      allowStaleOnError = true,
      signal,
    } = options;

    const hasCachedData = Boolean(state.dataset && state.searchIndex);
    const isFresh = hasCachedData && isFreshTimestamp(state.fetchedAt, ttlMs);

    if (!forceRefresh && isFresh) {
      return makeSnapshot(state, {
        ttlMs,
        returnedFrom: "cache",
        usedStaleFallback: false,
      });
    }

    if (!forceRefresh && state.loadingPromise) {
      return state.loadingPromise;
    }

    state.loadingPromise = refreshTaxonomy({
      allowStaleOnError,
      signal,
    }).finally(() => {
      state.loadingPromise = null;
    });

    return state.loadingPromise;
  }

  function getCachedSnapshot() {
    if (!state.dataset || !state.searchIndex) {
      return null;
    }

    return makeSnapshot(state, {
      ttlMs,
      returnedFrom: "cache",
      usedStaleFallback: false,
    });
  }

  function requireReadyState() {
    if (!state.dataset || !state.searchIndex) {
      throw buildServiceError(text.errors.notReady);
    }

    return {
      dataset: state.dataset,
      searchIndex: state.searchIndex,
    };
  }

  async function getDataset(options = {}) {
    const snapshot = await ensureReady(options);
    return snapshot.dataset;
  }

  async function getSearchIndex(options = {}) {
    const snapshot = await ensureReady(options);
    return snapshot.searchIndex;
  }

  async function searchOccupations(query, options = {}) {
    const snapshot = await ensureReady(options);
    return searchOskaDocuments(query, snapshot.searchIndex?.occupations?.docs, {
      limit: options.limit,
      minScore: options.minScore,
    });
  }

  async function searchSkills(query, options = {}) {
    const snapshot = await ensureReady(options);
    return searchOskaDocuments(query, snapshot.searchIndex?.skills?.docs, {
      limit: options.limit,
      minScore: options.minScore,
    });
  }

  async function searchFields(query, options = {}) {
    const snapshot = await ensureReady(options);
    return searchOskaDocuments(query, snapshot.searchIndex?.fields?.docs, {
      limit: options.limit,
      minScore: options.minScore,
    });
  }

  async function findBestOccupation(query, options = {}) {
    const snapshot = await ensureReady(options);
    return findBestOccupationMatch(query, snapshot.searchIndex, {
      minScore: options.minScore,
    });
  }

  async function findBestSkill(query, options = {}) {
    const snapshot = await ensureReady(options);
    return findBestSkillMatch(query, snapshot.searchIndex, {
      minScore: options.minScore,
    });
  }

  async function findBestField(query, options = {}) {
    const snapshot = await ensureReady(options);
    return findBestFieldMatch(query, snapshot.searchIndex, {
      minScore: options.minScore,
    });
  }

  async function getOccupation(code, options = {}) {
    const snapshot = await ensureReady(options);
    return getOccupationByCode(code, snapshot.searchIndex);
  }

  async function getSkill(code, options = {}) {
    const snapshot = await ensureReady(options);
    return getSkillByCode(code, snapshot.searchIndex);
  }

  async function getField(code, options = {}) {
    const snapshot = await ensureReady(options);
    return getFieldByCode(code, snapshot.searchIndex);
  }

  function invalidate() {
    state.generation += 1;
    state.dataset = null;
    state.searchIndex = null;
    state.fetchedAt = null;
    state.source = null;
    state.loadingPromise = null;
    state.lastError = null;
  }

  function getStatus() {
    return {
      ready: Boolean(state.dataset && state.searchIndex),
      fresh: isFreshTimestamp(state.fetchedAt, ttlMs),
      fetchedAt: state.fetchedAt,
      source: state.source,
      loading: state.loadingPromise !== null,
      hasError: state.lastError instanceof Error,
      lastError: state.lastError?.message || null,
      ttlMs,
      occupationCount: state.dataset?.meta?.occupationCount ?? 0,
      skillCount: state.dataset?.meta?.skillCount ?? 0,
      fieldCount: state.dataset?.meta?.fieldCount ?? 0,
    };
  }

  async function warm(options = {}) {
    return ensureReady({
      ...options,
      forceRefresh: coerceBoolean(options.forceRefresh, false),
    });
  }

  async function healthCheck(options = {}) {
    const apiHealth = await client.healthCheck(options);

    return {
      ok: apiHealth.ok,
      api: apiHealth,
      cache: getStatus(),
      hasUsableCache: Boolean(state.dataset && state.searchIndex),
      cacheFresh: isFreshTimestamp(state.fetchedAt, ttlMs),
    };
  }

  return {
    ttlMs,

    ensureReady,
    refreshTaxonomy,
    warm,

    getDataset,
    getSearchIndex,
    getCachedSnapshot,
    getStatus,
    invalidate,

    searchOccupations,
    searchSkills,
    searchFields,

    findBestOccupation,
    findBestSkill,
    findBestField,

    getOccupation,
    getSkill,
    getField,

    healthCheck,

    // Mostly for advanced/internal usage.
    requireReadyState,
  };
}

let sharedCareerTaxonomyService = null;
let sharedCareerTaxonomyServiceConfigSignature = null;

function buildSharedConfigSignature(config = {}) {
  return JSON.stringify({
    baseUrl: config.baseUrl || null,
    ttlMs: config.ttlMs || null,
    hasClient: Boolean(config.client),
    locale: config.locale || config.language || config.documentLanguage || null,
  });
}

export function getSharedCareerTaxonomyService(config = {}) {
  const signature = buildSharedConfigSignature(config);

  if (!sharedCareerTaxonomyService) {
    sharedCareerTaxonomyService = createCareerTaxonomyService(config);
    sharedCareerTaxonomyServiceConfigSignature = signature;
    return sharedCareerTaxonomyService;
  }

  if (signature !== sharedCareerTaxonomyServiceConfigSignature) {
    const locale =
      config.locale || config.language || config.documentLanguage || "et";
    throw new Error(getCareerTaxonomyText(locale).errors.sharedConfigMismatch);
  }

  return sharedCareerTaxonomyService;
}
