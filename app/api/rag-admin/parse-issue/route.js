// app/api/rag-admin/parse-issue/route.js
import {
  json,
  requireAdmin,
  requireRagConfig,
  fetchWithRetry,
  ragHeaders,
} from "@/lib/rag";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin.ok) return json({ ok: false, message: admin.message }, admin.status);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Keha peab olema JSON." }, 400);
  }

  const docId = typeof body?.docId === "string" ? body.docId.trim() : "";
  if (!docId) return json({ ok: false, message: "docId on kohustuslik." }, 400);

  // valikulised: offset, maxItems (võivad tulla stringina)
  const offset =
    Number.isFinite(body?.offset)
      ? body.offset
      : typeof body?.offset === "string" && body.offset.trim() !== ""
      ? Number(body.offset)
      : undefined;

  const maxItems =
    Number.isFinite(body?.maxItems)
      ? body.maxItems
      : typeof body?.maxItems === "string" && body.maxItems.trim() !== ""
      ? Number(body.maxItems)
      : undefined;

  const cfg = requireRagConfig();
  if (!cfg.ok) return json({ ok: false, message: cfg.message }, cfg.status);

  const url = `${cfg.base}/parse/issue`;
  const payload = { docId };
  if (typeof offset === "number" && Number.isFinite(offset)) payload.offset = offset;
  if (typeof maxItems === "number" && Number.isFinite(maxItems)) payload.maxItems = maxItems;

  try {
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: ragHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const raw = await res.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = { raw };
    }

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG parse/issue viga (${res.status})`;
      return json({ ok: false, message: msg, response: data }, 502);
    }

    // FastAPI tagastab: { ok, docId, foundTocItems, autoOffset, usingOffset, drafts: [...] }
    return json({ ok: true, ...data });
  } catch (err) {
    const msg =
      err?.name === "AbortError"
        ? "RAG päring aegus (timeout)."
        : `RAG ühenduse viga: ${err?.message || String(err)}`;
    return json({ ok: false, message: msg }, 502);
  }
}
