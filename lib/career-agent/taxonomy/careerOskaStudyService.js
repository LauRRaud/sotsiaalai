const DEFAULT_TIMEOUT_MS = 8000;

const studyPlaceCache = new Map();

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueByKey(items = [], getKey) {
  const seen = new Set();
  const results = [];

  for (const item of toSafeArray(items)) {
    const key = getKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    results.push(item);
  }

  return results;
}

function decodeHtmlEntities(value = "") {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/giu, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10))
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'");
}

function stripHtml(value = "") {
  return decodeHtmlEntities(String(value || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear() {
      clearTimeout(timeoutId);
    },
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

function splitStudyPlaceLabel(label) {
  const safeLabel = coerceString(label);
  if (!safeLabel) {
    return {
      label: null,
      programme: null,
      provider: null,
    };
  }

  const [programmePart, ...providerParts] = safeLabel
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    label: safeLabel,
    programme: programmePart || safeLabel,
    provider: providerParts.join(", ") || null,
  };
}

function extractStudySection(html = "") {
  const source = String(html || "");
  const headingIndex = source.search(/Kus\s+õppida/i);
  if (headingIndex < 0) return "";

  const blockStart = Math.max(0, headingIndex - 200);
  const sectionTail = source.slice(blockStart);
  const nextHeadingMatch = /<h[1-6]\b[^>]*>[\s\S]{0,200}?(?:Tutvu uuringutega|Kutsestandardid|Vajalikud oskused|Töövaldkonnad|Lisainfo)/iu.exec(
    sectionTail
  );

  if (!nextHeadingMatch || nextHeadingMatch.index === undefined) {
    return sectionTail;
  }

  return sectionTail.slice(0, nextHeadingMatch.index);
}

export function extractStudyPlacesFromHtml(html = "", pageUrl = "") {
  const section = extractStudySection(html);
  if (!section) return [];

  const baseUrl = coerceString(pageUrl) || "https://oskused.ee/";
  const links = [];

  for (const match of section.matchAll(/<a\b([^>]*)href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/giu)) {
    const href = coerceString(match[2]);
    const label = stripHtml(match[3]);

    if (!href || !label || !label.includes(",")) continue;
    if (/näita\s+(veel|vähem)/i.test(label)) continue;

    const split = splitStudyPlaceLabel(label);
    links.push({
      ...split,
      url: new URL(href, baseUrl).toString(),
    });
  }

  return uniqueByKey(
    links.filter((item) => item.provider),
    (item) => `${item.label}::${item.url}`
  );
}

async function fetchOccupationPageHtml(url, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    return "";
  }

  const timeout = createTimeoutSignal(
    Number.isFinite(options.timeoutMs) ? options.timeoutMs : DEFAULT_TIMEOUT_MS
  );
  const signal = mergeAbortSignals(options.signal, timeout.signal);

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response?.ok) {
      return "";
    }

    return await response.text();
  } catch {
    return "";
  } finally {
    timeout.clear();
  }
}

export async function loadOccupationStudyPlaces(occupation = {}, options = {}) {
  const url =
    coerceString(occupation?.externalUrl) ||
    coerceString(occupation?.localCatalog?.externalUrl) ||
    null;

  if (!url) {
    return [];
  }

  const cacheKey = String(url);
  if (options.forceRefresh !== true && studyPlaceCache.has(cacheKey)) {
    return studyPlaceCache.get(cacheKey);
  }

  const pendingPromise = (async () => {
    const html = await fetchOccupationPageHtml(url, options);
    return extractStudyPlacesFromHtml(html, url);
  })();

  studyPlaceCache.set(cacheKey, pendingPromise);

  try {
    return await pendingPromise;
  } catch (error) {
    studyPlaceCache.delete(cacheKey);
    throw error;
  }
}

