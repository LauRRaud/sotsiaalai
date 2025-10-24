// app/api/rag-admin/ingest-articles/route.js
import { NextResponse } from "next/server";
import { normalizeRagBase } from "@/lib/rag";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

/* ---------- helpers ---------- */
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};
const json = (data, status = 200) =>
  NextResponse.json(data, { status, headers: NO_STORE });

  async function getAuthOptions() {
    try {
      const mod = await import("@/auth");
      return mod.authOptions || mod.default || mod.authConfig;
    } catch {
      return undefined;
    }
  }

async function requireAdmin() {
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  const isAdmin =
    !!session?.user?.isAdmin ||
    String(session?.user?.role || "").toUpperCase() === "ADMIN";

  if (!session?.user?.id) return { ok: false, status: 401, message: "Pole sisse logitud" };
  if (!isAdmin) return { ok: false, status: 403, message: "Ligipääs keelatud" };
  return { ok: true, userId: session.user.id };
}

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}
function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  const s = id.trim();
  return s.length >= 8 && s.length <= 200;
}
/* ---------- validators ---------- */
const AUDIENCE_VALUES = new Set(["SOCIAL_WORKER", "CLIENT", "BOTH"]);
function normAudience(v) {
  if (!v || typeof v !== "string") return undefined;
  const s = v.trim().toUpperCase();
  return AUDIENCE_VALUES.has(s) ? s : undefined;
}
function sanitizeArticle(a) {
  if (!isPlainObject(a)) return null;

  const out = {};
  const title = typeof a.title === "string" ? a.title.trim() : "";
  const pageRange = typeof a.pageRange === "string" ? a.pageRange.trim() : "";
  if (!title || !pageRange) return null;

  out.title = title;
  out.pageRange = pageRange;

  if (Array.isArray(a.authors)) {
    out.authors = a.authors
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean)
      .slice(0, 12);
  }
  if (typeof a.section === "string" && a.section.trim()) out.section = a.section.trim();
  if (typeof a.description === "string" && a.description.trim())
    out.description = a.description.trim();

  if (a.year != null) {
    const y = Number(a.year);
    if (Number.isFinite(y) && y >= 1800 && y <= 2100) out.year = y;
  }

  if (typeof a.journalTitle === "string" && a.journalTitle.trim())
    out.journalTitle = a.journalTitle.trim();

  if (typeof a.issueLabel === "string" && a.issueLabel.trim())
    out.issueLabel = a.issueLabel.trim();

  const aud = normAudience(a.audience);
  if (aud) out.audience = aud;

  if (
    (typeof a.startPage === "number" || typeof a.startPage === "string") &&
    (typeof a.endPage === "number" || typeof a.endPage === "string")
  ) {
    const s = Number(a.startPage);
    const e = Number(a.endPage);
    if (Number.isFinite(s) && Number.isFinite(e) && s > 0 && e > 0) {
      out.startPage = s;
      out.endPage = e;
    }
  } else if (a.offset != null) {
    const n = Number(a.offset);
    if (Number.isFinite(n)) out.offset = n;
  }

  return out;
}

/* ---------- RAG target helpers ---------- */
function getArticlesPathTemplate() {
  return (process.env.RAG_INGEST_ARTICLES_PATH || "/ingest/articles").trim();
}
function buildTargetUrl({ ragBase, docId, pathTpl }) {
  const base = normalizeRagBase(ragBase);
  const withSlash = pathTpl.startsWith("/") ? pathTpl : `/${pathTpl}`;
  if (withSlash.includes(":docId")) {
    return `${base}${withSlash.replace(":docId", encodeURIComponent(docId))}`;
  }
  return `${base}${withSlash}`;
}
function buildPayload({ pathTpl, docId, articles }) {
  const pathHasDocId = pathTpl.includes(":docId");
  return pathHasDocId ? { articles } : { docId, articles };
}

/* ---------- fetch with small retry ---------- */
async function fetchWithRetry(makeReq, tries = 2) {
  let lastErr;
  for (let i = 0; i < Math.max(1, tries); i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);
    try {
      const res = await makeReq(controller.signal);
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw lastErr;
}

/* ---------- POST /api/rag-admin/ingest-articles ---------- */
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
  const articlesRaw = Array.isArray(body?.articles) ? body.articles : [];
  if (!docId) return json({ ok: false, message: "docId on kohustuslik." }, 400);
  if (!isPlausibleId(docId)) return json({ ok: false, message: "Vigane docId formaadis." }, 400);
  if (!articlesRaw.length) return json({ ok: false, message: "Lisa vähemalt üks artikkel." }, 400);

  const articles = articlesRaw.map(sanitizeArticle).filter(Boolean);
  if (!articles.length) {
    return json({ ok: false, message: "Artiklite väljad on vigased või puudulikud." }, 400);
  }
  if (articles.length > 200) {
    return json({ ok: false, message: "Maksimaalselt 200 artiklit korraga." }, 400);
  }

  const ragBase = (process.env.RAG_API_BASE || "").trim();
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) return json({ ok: false, message: "RAG_API_BASE puudub serveri keskkonnast." }, 500);
  if (!apiKey) return json({ ok: false, message: "RAG_SERVICE_API_KEY puudub serveri keskkonnast." }, 500);

  // --- DB: märgi PROCESSING kõik kirjed, mille remoteId = docId ---
  const { prisma } = await import("@/lib/prisma");
  try {
    await prisma.ragDocument.updateMany({
      where: { remoteId: docId },
      data: { status: "PROCESSING", error: null, updatedAt: new Date() },
    });
  } catch {
    // mitte-kriitiline; jätkame
  }

  const pathTpl = getArticlesPathTemplate();
  const targetUrl = buildTargetUrl({ ragBase, docId, pathTpl });
  const payload = buildPayload({ pathTpl, docId, articles });

  const fwdReqId = req.headers.get("x-request-id");
  const fwdClientId = req.headers.get("x-client-id");

  try {
    const res = await fetchWithRetry(
      (signal) =>
        fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-API-Key": apiKey,
            ...(fwdReqId ? { "X-Request-Id": fwdReqId } : {}),
            ...(fwdClientId ? { "X-Client-Id": fwdClientId } : {}),
          },
          body: JSON.stringify(payload),
          cache: "no-store",
          signal,
        }),
      2
    );

    const raw = await res.text().catch(() => "");
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = { raw: typeof raw === "string" ? raw.slice(0, 500) : null };
    }

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG ingest viga (${res.status})`;
      try {
        await prisma.ragDocument.updateMany({
          where: { remoteId: docId },
          data: { status: "FAILED", error: msg, updatedAt: new Date() },
        });
      } catch {}
      const status = res.status >= 400 && res.status < 600 ? res.status : 502;
      return json({ ok: false, message: msg, response: data }, status);
    }

    const count =
      Number.isFinite(data?.count) ? Number(data.count)
      : Array.isArray(data?.inserted) ? data.inserted.length
      : articles.length;

    const nextStatus = count > 0 ? "COMPLETED" : "PROCESSING";
    try {
      await prisma.ragDocument.updateMany({
        where: { remoteId: docId },
        data: {
          status: nextStatus,
          error: null,
          updatedAt: new Date(),
          insertedAt: nextStatus === "COMPLETED" ? new Date() : undefined,
        },
      });
    } catch {}

    return json({ ok: true, count, rag: data });
  } catch (err) {
    const msg =
      err?.name === "AbortError"
        ? "RAG päring aegus (timeout)."
        : `RAG ühenduse viga: ${err?.message || String(err)}`;
    try {
      await prisma.ragDocument.updateMany({
        where: { remoteId: docId },
        data: { status: "FAILED", error: msg, updatedAt: new Date() },
      });
    } catch {}
    return json({ ok: false, message: msg }, 502);
  }
}
