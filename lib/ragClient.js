// lib/ragClient.js
import { Buffer } from "node:buffer";

/** Trim trailing slashes from base URL (handles multiple). */
function normalizeBaseUrl(raw) {
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

/** Build headers for RAG service calls. Uses X-API-Key (FastAPI ootab). */
function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  const apiKey = process.env.RAG_API_KEY;
  if (apiKey) headers["X-API-Key"] = apiKey;
  return headers;
}

const DEFAULT_TIMEOUT = Number(process.env.RAG_API_TIMEOUT_MS ?? 45000);

/** POST helper with timeout + robust JSON handling. */
async function postJson(url, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload ?? {}),
      signal: controller.signal,
    });
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { ok: false, status: res.status, auth: true, message: "Unauthorized", response: data };
      }
      return { ok: false, status: res.status, message: data?.message || res.statusText || "RAG server error", response: data };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    const message = err?.name === "AbortError" ? "RAG server timeout" : err?.message || "RAG request failed";
    return { ok: false, message, error: err };
  } finally {
    clearTimeout(timeout);
  }
}

/** DELETE helper with timeout + robust JSON handling. */
async function delJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: buildHeaders(),
      signal: controller.signal,
    });
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { ok: false, status: res.status, auth: true, message: "Unauthorized", response: data };
      }
      return { ok: false, status: res.status, message: data?.message || res.statusText || "RAG server error", response: data };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    const message = err?.name === "AbortError" ? "RAG server timeout" : err?.message || "RAG request failed";
    return { ok: false, message, error: err };
  } finally {
    clearTimeout(timeout);
  }
}

/** Push FILE to RAG. */
export async function pushFileToRag({ docId, fileName, mimeType, data, title, description, audience }) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) return { ok: false, message: "RAG_API_BASE is not configured" };
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data || []);
  return postJson(`${base}/ingest/file`, {
    docId, fileName, mimeType, data: buffer.toString("base64"), title, description, audience,
  });
}

/** Push URL to RAG. */
export async function pushUrlToRag({ docId, url, title, description, audience }) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) return { ok: false, message: "RAG_API_BASE is not configured" };
  return postJson(`${base}/ingest/url`, { docId, url, title, description, audience });
}

/** Request reindex (FastAPI: POST /documents/{id}/reindex). */
export async function requestReindex(docId) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) return { ok: false, message: "RAG_API_BASE is not configured" };
  return postJson(`${base}/documents/${encodeURIComponent(docId)}/reindex`, {});
}

/** Delete a document (FastAPI: DELETE /documents/{id}). */
export async function deleteRagDocument(docId) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) return { ok: false, message: "RAG_API_BASE is not configured" };
  return delJson(`${base}/documents/${encodeURIComponent(docId)}`);
}

/**
 * Search with optional filters (e.g., { audience: { $in: ["CLIENT","BOTH"] } }).
 * FastAPI /search toetab: { query, top_k, filterDocId?, where? }
 */
export async function searchRag({ query, topK = 4, filters }) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) return { ok: false, message: "RAG_API_BASE is not configured" };
  if (!query || !String(query).trim()) return { ok: false, message: "Query is required" };

  const payload = {
    query: String(query),
    top_k: Number.isFinite(topK) ? Number(topK) : 4,
    where: filters && typeof filters === "object" ? filters : undefined,
  };

  const raw = await postJson(`${base}/search`, payload);
  if (!raw.ok) return raw;

  const results = Array.isArray(raw?.data?.results) ? raw.data.results : [];

  // Vormista chat route’i jaoks “matches”
  return {
    ok: true,
    status: raw.status,
    data: {
      matches: results.map((r, i) => ({
        id: r.id || `res-${i}`,
        text: r.chunk,
        distance: r.distance ?? null,
        metadata: {
          doc_id: r.doc_id,
          title: r.title,
          description: r.description,
          url: r.url,
          storedFile: r.filePath,
          audience: r.audience,
          page: r.page ?? null,
        },
      })),
      results,
    },
  };
}
