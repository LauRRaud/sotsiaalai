"use client";

export async function fetchRagDocumentStatus(docId) {
  const normalizedDocId = String(docId || "").trim();
  const fallback = {
    docId: normalizedDocId,
    exists: false,
    chunks: 0,
    title: "",
    status: "",
    updatedAt: null,
    lastIngested: null,
    error: ""
  };

  if (!normalizedDocId) {
    return {
      ...fallback,
      error: "Missing doc_id"
    };
  }

  try {
    const response = await fetch(`/api/rag/documents/${encodeURIComponent(normalizedDocId)}`, {
      cache: "no-store"
    });
    const payload = await response.json().catch(() => ({}));

    if (response.status === 404) {
      return fallback;
    }

    if (!response.ok || payload?.ok === false) {
      return {
        ...fallback,
        error: String(payload?.message || "RAG document lookup failed")
      };
    }

    return {
      ...fallback,
      docId: String(payload?.docId || payload?.id || normalizedDocId).trim() || normalizedDocId,
      exists: true,
      chunks: Number.isFinite(Number(payload?.chunks)) ? Number(payload.chunks) : 0,
      title: String(payload?.title || "").trim(),
      status: String(payload?.status || "").trim() || "COMPLETED",
      updatedAt: payload?.updatedAt || null,
      lastIngested: payload?.lastIngested || null
    };
  } catch (error) {
    return {
      ...fallback,
      error: String(error?.message || "RAG document lookup failed")
    };
  }
}
