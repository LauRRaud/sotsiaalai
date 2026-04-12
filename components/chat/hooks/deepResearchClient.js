function makeAbortError() {
  const error = new Error("AbortError");
  error.name = "AbortError";
  return error;
}

async function sleepWithSignal(ms, signal) {
  const delay = Number(ms);
  if (!Number.isFinite(delay) || delay <= 0) return;
  if (signal?.aborted) throw makeAbortError();
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, delay);

    const onAbort = () => {
      cleanup();
      reject(makeAbortError());
    };

    const cleanup = () => {
      clearTimeout(timer);
      try {
        signal?.removeEventListener?.("abort", onAbort);
      } catch {}
    };

    try {
      signal?.addEventListener?.("abort", onAbort, { once: true });
    } catch {}
  });
}

export function translateDeepResearchError(key, t) {
  const resolved = t(key);
  return resolved && resolved !== key ? resolved : t("chat.deep_research.error_generic");
}

export function normalizeGeo(rawGeo = {}) {
  const levelRaw = String(rawGeo?.level || "ALL").trim().toUpperCase();
  const level =
    levelRaw === "NATIONAL" || levelRaw === "MUNICIPALITY" || levelRaw === "DISTRICT"
      ? levelRaw
      : "ALL";
  return {
    level,
    country: "EE",
    municipality_id: String(rawGeo?.municipality_id || rawGeo?.municipalityId || "").trim(),
    municipality_name: String(rawGeo?.municipality_name || "").trim(),
    district_id: String(rawGeo?.district_id || rawGeo?.districtId || "").trim(),
    district_name: String(rawGeo?.district_name || "").trim(),
  };
}

export function normalizeSources(rawSources) {
  if (!Array.isArray(rawSources)) return [];
  return rawSources
    .filter(item => item && typeof item === "object")
    .map(item => ({
      id: String(item.id || "").trim() || undefined,
      title: String(item.title || "").trim() || undefined,
      url: String(item.url || "").trim() || undefined,
      fileName: String(item.fileName || "").trim() || undefined,
      section: String(item.section || "").trim() || undefined,
      year: Number.isFinite(Number(item.year)) ? Number(item.year) : undefined,
      issueLabel: String(item.issueLabel || "").trim() || undefined,
      pageRange: String(item.pageRange || "").trim() || undefined,
      short_ref: String(item.short_ref || "").trim() || undefined,
      source_type: String(item.source_type || "").trim() || undefined,
    }))
    .filter(item => item.id || item.title || item.url || item.fileName);
}

export function isTerminalResearchJobStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  return normalized === "done" || normalized === "error" || normalized === "cancelled";
}

export async function pollResearchJobUntilTerminal(jobId, options = {}) {
  const normalizedJobId = String(jobId || "").trim();
  if (!normalizedJobId) {
    throw new Error("chat.deep_research.error_generic");
  }

  const fetchImpl = options.fetchImpl || fetch;
  const signal = options.signal;
  const intervalMs = Math.max(0, Number(options.intervalMs) || 3000);
  const maxAttempts = Math.max(1, Number(options.maxAttempts) || 20);
  const url = `/api/research/jobs/${encodeURIComponent(normalizedJobId)}`;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (signal?.aborted) throw makeAbortError();

    try {
      const response = await fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-store",
        },
        cache: "no-store",
        signal,
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body?.job) {
        if (isTerminalResearchJobStatus(body.job.status)) {
          return body.job;
        }
      } else if (attempt >= maxAttempts - 1) {
        throw new Error(body?.messageKey || "chat.deep_research.error_generic");
      }
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      if (attempt >= maxAttempts - 1) {
        throw error;
      }
    }

    if (attempt < maxAttempts - 1) {
      await sleepWithSignal(intervalMs, signal);
    }
  }

  throw new Error("research.error.timeout");
}
