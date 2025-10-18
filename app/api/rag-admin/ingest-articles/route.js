// app/api/rag-admin/ingest-articles/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

/* ---------- utils ---------- */
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

async function getAuthOptions() {
  try {
    const mod = await import("@/pages/api/auth/[...nextauth]");
    return mod.authOptions || mod.default || mod.authConfig;
  } catch {
    try {
      const mod = await import("@/auth");
      return mod.authOptions || mod.default || mod.authConfig;
    } catch {
      return undefined;
    }
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

/* ---------- small helpers ---------- */
function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}
function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  const s = id.trim();
  return s.length >= 8 && s.length <= 200;
}
function normalizeBase(raw) {
  const t = String(raw || "").trim().replace(/\/+$/, "");
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `http://${t}`;
}

/* ---------- validators ---------- */
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

  if (Number.isFinite(a.year)) out.year = a.year;
  else if (typeof a.year === "string" && a.year.trim() && Number.isFinite(Number(a.year)))
    out.year = Number(a.year);

  if (typeof a.journalTitle === "string" && a.journalTitle.trim())
    out.journalTitle = a.journalTitle.trim();

  if (typeof a.issueLabel === "string" && a.issueLabel.trim())
    out.issueLabel = a.issueLabel.trim();

  if (typeof a.audience === "string" && a.audience.trim())
    out.audience = a.audience.trim().toUpperCase();

  // kas offset või startPage+endPage
  if (
    (typeof a.startPage === "number" || typeof a.startPage === "string") &&
    (typeof a.endPage === "number" || typeof a.endPage === "string")
  ) {
    const s = Number(a.startPage);
    const e = Number(a.endPage);
    if (Number.isFinite(s) && Number.isFinite(e)) {
      out.startPage = s;
      out.endPage = e;
    }
  } else if (typeof a.offset === "number" || typeof a.offset === "string") {
    const n = Number(a.offset);
    if (Number.isFinite(n)) out.offset = n;
  }

  return out;
}

/* ---------- RAG target helpers ---------- */
function buildTargetUrl({ ragBase, docId }) {
  const base = normalizeBase(ragBase);
  const path = (process.env.RAG_INGEST_ARTICLES_PATH || "/ingest/articles").trim();

  if (path.includes(":docId")) {
    return `${base}${path.startsWith("/") ? "" : "/"}${path.replace(":docId", encodeURIComponent(docId))}`;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildPayload({ pathHasDocId, docId, articles }) {
  // kui teel on :docId, enamik backendeid EI oota docId kehas
  return pathHasDocId ? { articles } : { docId, articles };
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

  const ragBase = (process.env.RAG_API_BASE || "").trim();
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) return json({ ok: false, message: "RAG_API_BASE puudub serveri keskkonnast." }, 500);
  if (!apiKey) return json({ ok: false, message: "RAG_SERVICE_API_KEY puudub serveri keskkonnast." }, 500);

  const pathTpl = (process.env.RAG_INGEST_ARTICLES_PATH || "/ingest/articles").trim();
  const pathHasDocId = pathTpl.includes(":docId");
  const targetUrl = buildTargetUrl({ ragBase, docId });
  const payload = buildPayload({ pathHasDocId, docId, articles });

  // Timeout + üks kiire retry
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

  // kanna edasi X-Request-Id (kui olemas) ja valikuline X-Client-Id
  const fwdReqId = req.headers.get("x-request-id");
  const fwdClientId = req.headers.get("x-client-id");

  const doFetch = () =>
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
      signal: controller.signal,
    });

  let res;
  try {
    try {
      res = await doFetch();
    } catch {
      await new Promise((r) => setTimeout(r, 250));
      res = await doFetch();
    }
  } catch (err) {
    clearTimeout(timer);
    const msg =
      err?.name === "AbortError"
        ? "RAG päring aegus (timeout)."
        : `RAG ühenduse viga: ${err?.message || String(err)}`;
    return json({ ok: false, message: msg }, 502);
  } finally {
    clearTimeout(timer);
  }

  const raw = await res.text().catch(() => "");
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { raw: typeof raw === "string" ? raw.slice(0, 500) : null };
  }

  if (!res.ok) {
    const msg = data?.detail || data?.message || `RAG ingest viga (${res.status})`;
    const status = res.status >= 400 && res.status < 600 ? res.status : 502;
    return json({ ok: false, message: msg, response: data }, status);
  }

  const count =
    Number.isFinite(data?.count) ? Number(data.count)
    : Array.isArray(data?.inserted) ? data.inserted.length
    : articles.length;

  return json({
    ok: true,
    count,
    rag: data,
  });
}
