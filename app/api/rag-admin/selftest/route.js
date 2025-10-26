// app/api/rag-admin/selftest/route.js
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_TIMEOUT = Number(process.env.RAG_TIMEOUT_MS || 20000);

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
  return { ok: true, session };
}

function normalizeBase(raw) {
  const t = String(raw || "").trim().replace(/\/+$/, "");
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `http://${t}`;
}

async function fetchWithTimeout(url, init, timeoutMs = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(t);
    return res;
  } catch (err) {
    clearTimeout(t);
    throw err;
  }
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin.ok) return json({ ok: false, message: admin.message }, admin.status);

  const cookie = req.headers.get("cookie") || "";
  const ragBase = normalizeBase(process.env.RAG_API_BASE || "");
  const apiKey = (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  const steps = [];
  function step(name, ok, extra = {}) {
    steps.push({ name, ok: !!ok, ...extra });
  }

  // 1) ENV kontroll
  const envOk = !!(ragBase && apiKey);
  step("env", envOk, { ragBase: !!ragBase, apiKey: !!apiKey });
  if (!envOk) return json({ ok: false, steps, message: "RAG_API_BASE või API võti puudub" }, 500);

  // 2) RAG /health
  try {
    const r = await fetchWithTimeout(`${ragBase.replace(/\/+$/, "")}/health`, {
      method: "GET",
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      cache: "no-store",
    }, 8000);
    const raw = await r.text();
    const data = raw ? JSON.parse(raw) : {};
    step("rag-health", r.ok, { status: r.status, data: typeof data === "object" ? data : {} });
    if (!r.ok) return json({ ok: false, steps, message: "RAG /health ei ole OK" }, 502);
  } catch (err) {
    step("rag-health", false, { error: err?.message || String(err) });
    return json({ ok: false, steps, message: "RAG /health viga" }, 502);
  }

  // 3) Ingest test document
  const uuid = randomUUID();
  const docId = `selftest-${uuid}`;
  const magicWord = `RAGSELFTEST-${uuid}`;
  const text = `See on SotsiaalAI RAG enesetest. Võlusõna: ${magicWord}.`;
  const payload = {
    docId,
    fileName: `selftest-${uuid}.txt`,
    mimeType: "text/plain",
    data: Buffer.from(text, "utf8").toString("base64"),
    title: `Selftest ${uuid}`,
    description: "Automaatne RAG enesetest",
    audience: "BOTH",
  };
  try {
    const r = await fetchWithTimeout(`${ragBase.replace(/\/+$/, "")}/ingest/file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }, DEFAULT_TIMEOUT);
    const body = await r.json().catch(() => ({}));
    const ok = r.ok && (Number.isFinite(body?.inserted) ? body.inserted > 0 : true);
    step("ingest", ok, { status: r.status, inserted: body?.inserted ?? null });
    if (!ok) return json({ ok: false, steps, message: "Ingest ebaõnnestus" }, 502);
  } catch (err) {
    step("ingest", false, { error: err?.message || String(err) });
    return json({ ok: false, steps, message: "Ingest päringu viga" }, 502);
  }

  // 3b) Frontendi upload-route (form-data) – kontrolli rakenduse enda vahendeid
  let uploadedRemoteId = null;
  try {
    const fd = new FormData();
    const blob = new Blob([text], { type: "text/plain" });
    fd.append("file", blob, `selftest2-${uuid}.txt`);
    fd.append("audience", "BOTH");
    fd.append("title", `Selftest2 ${uuid}`);
    const r = await fetchWithTimeout(`${new URL(req.url).origin}/api/rag-admin/upload`, {
      method: "POST",
      headers: { cookie },
      body: fd,
      cache: "no-store",
    }, DEFAULT_TIMEOUT);
    const body = await r.json().catch(() => ({}));
    const ok = r.ok && body?.ok === true && body?.doc?.remoteId;
    if (ok) uploadedRemoteId = body?.doc?.remoteId;
    step("upload-route", !!ok, { status: r.status });
  } catch (err) {
    step("upload-route", false, { error: err?.message || String(err) });
  }

  // 4) /documents (kas dokument on nähtav?)
  try {
    const r = await fetchWithTimeout(`${ragBase.replace(/\/+$/, "")}/documents?limit=50`, {
      method: "GET",
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      cache: "no-store",
    }, DEFAULT_TIMEOUT);
    const body = await r.json().catch(() => ([]));
    const found = Array.isArray(body) && body.some((d) => d?.docId === docId || d?.id === docId);
    step("documents", found, { status: r.status });
  } catch (err) {
    step("documents", false, { error: err?.message || String(err) });
  }

  // 5) /search
  try {
    const r = await fetchWithTimeout(`${ragBase.replace(/\/+$/, "")}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({ query: magicWord, top_k: 5, where: { doc_id: docId }, include: ["documents","metadatas","distances"] }),
      cache: "no-store",
    }, DEFAULT_TIMEOUT);
    const body = await r.json().catch(() => ({}));
    const hit = Array.isArray(body?.results) && body.results.some((m) => (m?.doc_id || m?.metadata?.doc_id) === docId);
    step("search", r.ok && hit, { status: r.status });
  } catch (err) {
    step("search", false, { error: err?.message || String(err) });
  }

  // 6) Vestluse API (mittestreamiv), admin sessiooniga
  try {
    const r = await fetchWithTimeout(`${new URL(req.url).origin}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        cookie, // forward session cookie
      },
      body: JSON.stringify({ message: magicWord, wantStream: false, persist: false, role: "SOCIAL_WORKER" }),
      cache: "no-store",
    }, DEFAULT_TIMEOUT);
    const body = await r.json().catch(() => ({}));
    const ok = r.ok && body?.ok === true && typeof body?.answer === "string";
    const hasSources = Array.isArray(body?.sources) && body.sources.length > 0;
    step("chat", ok && hasSources, { status: r.status, hasSources });
  } catch (err) {
    step("chat", false, { error: err?.message || String(err) });
  }

  // 7) Cleanup (mõlemad dokumendid kui võimalik)
  try {
    const r = await fetchWithTimeout(`${ragBase.replace(/\/+$/, "")}/documents/${encodeURIComponent(docId)}`, {
      method: "DELETE",
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      cache: "no-store",
    }, DEFAULT_TIMEOUT);
    let ok = r.ok;
    let status = r.status;
    if (uploadedRemoteId) {
      try {
        const r2 = await fetchWithTimeout(`${ragBase.replace(/\/+$/, "")}/documents/${encodeURIComponent(uploadedRemoteId)}`, {
          method: "DELETE",
          headers: { "X-API-Key": apiKey, Accept: "application/json" },
          cache: "no-store",
        }, DEFAULT_TIMEOUT);
        ok = ok && r2.ok;
        status = r2.ok ? status : r2.status;
      } catch {}
    }
    step("cleanup", ok, { status });
  } catch (err) {
    step("cleanup", false, { error: err?.message || String(err) });
  }

  const allOk = steps.every((s) => s.ok);
  return json({ ok: allOk, steps });
}

export async function GET() {
  return json({ ok: true, usage: "POST to run self-test" });
}
