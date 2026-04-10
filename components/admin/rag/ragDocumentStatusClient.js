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
    const response = await fetch(`/api/admin/rag/document-status/${encodeURIComponent(normalizedDocId)}`, {
      cache: "no-store"
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload?.ok === false) {
      return {
        ...fallback,
        error: String(payload?.message || "RAG document lookup failed")
      };
    }

    const item = payload?.item || payload || {};

    return {
      ...fallback,
      docId: String(item?.docId || item?.id || normalizedDocId).trim() || normalizedDocId,
      exists: item?.exists === true,
      chunks: Number.isFinite(Number(item?.chunks)) ? Number(item.chunks) : 0,
      title: String(item?.title || "").trim(),
      status: String(item?.status || "").trim() || "",
      updatedAt: item?.updatedAt || null,
      lastIngested: item?.lastIngested || null,
      error: String(item?.error || "").trim()
    };
  } catch (error) {
    return {
      ...fallback,
      error: String(error?.message || "RAG document lookup failed")
    };
  }
}
