// lib/ragClient.js
import { Buffer } from "node:buffer";

/**
 * Trim trailing slashes from base URL (handles multiple).
 */
function normalizeBaseUrl(raw) {
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

/**
 * Build headers for RAG service calls.
 * Uses X-API-Key to match the rag-service expectation.
 */
function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  const apiKey = process.env.RAG_API_KEY;
  if (apiKey) headers["X-API-Key"] = apiKey;
  return headers;
}

const DEFAULT_TIMEOUT = Number(process.env.RAG_API_TIMEOUT_MS ?? 45000);

/**
 * POST helper with timeout, robust JSON parsing and clear auth signal.
 */
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

    // Read raw text to safely handle empty bodies / non-JSON
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
      // Bubble up explicit auth signal for 401/403 so UI can redirect to signin
      if (res.status === 401 || res.status === 403) {
        return { ok: false, status: res.status, auth: true, message: "Unauthorized", response: data };
      }
      return {
        ok: false,
        status: res.status,
        message: data?.message || res.statusText || "RAG server error",
        response: data,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "RAG server timeout"
        : err?.message || "RAG request failed";
    return { ok: false, message, error: err };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Push a FILE to the RAG service for ingestion.
 */
export async function pushFileToRag({
  docId,
  fileName,
  mimeType,
  data,
  title,
  description,
  audience,
}) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) {
    return { ok: false, message: "RAG_API_BASE is not configured" };
  }
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data || []);
  return postJson(`${base}/ingest/file`, {
    docId,
    fileName,
    mimeType,
    data: buffer.toString("base64"),
    title,
    description,
    audience,
  });
}

/**
 * Push a URL to the RAG service for ingestion.
 */
export async function pushUrlToRag({ docId, url, title, description, audience }) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) {
    return { ok: false, message: "RAG_API_BASE is not configured" };
  }
  return postJson(`${base}/ingest/url`, {
    docId,
    url,
    title,
    description,
    audience,
  });
}

/**
 * Request reindex for an existing document.
 */
export async function requestReindex(docId) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) {
    return { ok: false, message: "RAG_API_BASE is not configured" };
  }
  return postJson(`${base}/ingest/reindex`, { docId });
}

/**
 * Semantic search against the RAG index.
 * Accepts optional filters which are sent as { where: filters }.
 */
export async function searchRag({ query, topK = 4, filters }) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) {
    return { ok: false, message: "RAG_API_BASE is not configured" };
  }
  if (!query || !String(query).trim()) {
    return { ok: false, message: "Query is required" };
  }
  return postJson(`${base}/search`, {
    query: String(query),
    top_k: Number.isFinite(topK) ? Number(topK) : 4,
    where: filters ?? undefined, // e.g., { audience: ["SOCIAL_WORKER","BOTH"] }
  });
}
