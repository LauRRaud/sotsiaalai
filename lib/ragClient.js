import { Buffer } from "node:buffer";

function normalizeBaseUrl(raw) {
  if (!raw) return null;
  return raw.replace(/[\/]$/, "");
}

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  const apiKey = process.env.RAG_API_KEY;
  if (apiKey) headers["X-API-Key"] = apiKey;
  return headers;
}

async function postJson(url, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.RAG_API_TIMEOUT_MS || 45000));
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await res.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); }
      catch { data = { message: text }; }
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: data?.message || res.statusText || "RAG server error",
        response: data,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err) {
    const message = err?.name === "AbortError" ? "RAG server timeout" : err?.message || "RAG request failed";
    return { ok: false, message, error: err };
  } finally {
    clearTimeout(timeout);
  }
}

export async function pushFileToRag({ docId, fileName, mimeType, data, title, description, audience }) {
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

export async function requestReindex(docId) {
  const base = normalizeBaseUrl(process.env.RAG_API_BASE);
  if (!base) {
    return { ok: false, message: "RAG_API_BASE is not configured" };
  }
  return postJson(`${base}/ingest/reindex`, { docId });
}

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
    top_k: Number.isFinite(topK) ? topK : 4,
    where: filters || undefined,
  });
}

