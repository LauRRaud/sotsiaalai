// app/api/rag-admin/url/route.js
import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import { isIP } from "node:net";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ------------------------- Consts ------------------------- */

const AUDIENCE_VALUES = new Set(["SOCIAL_WORKER", "CLIENT", "BOTH"]);
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/* ------------------------- Auth loader (joondatud teistega) ------------------------- */

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
  return { ok: true, userId: session.user.id, session };
}

/* ------------------------- Helpers ------------------------- */

class UrlSafetyError extends Error {
  constructor(message, status = 400, extras = {}) {
    super(message);
    this.status = status;
    this.extras = extras;
  }
}

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status, headers: NO_STORE });
}

function normalizeAudience(value) {
  if (!value) return null;
  const str = String(value).toUpperCase().trim();
  return AUDIENCE_VALUES.has(str) ? str : null;
}

function sanitizeUrl(value) {
  try {
    if (!value) return null;
    const parsed = new URL(String(value).trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

    const hostLower = parsed.hostname.toLowerCase();
    if (
      hostLower === "localhost" ||
      hostLower === "ip6-localhost" ||
      hostLower.endsWith(".localhost")
    ) {
      return null;
    }

    parsed.hash = ""; // ära kanna #fragmenti
    return parsed.toString();
  } catch {
    return null;
  }
}

function isPrivateAddress(address) {
  if (!address) return false;
  if (address.startsWith("127.")) return true;
  if (address === "0.0.0.0" || address === "255.255.255.255") return true;

  // IPv4 RFC1918 + link-local
  const parts = address.split(".").map((p) => Number(p));
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }

  // IPv6 lokaalsed
  const lower = address.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80")) return true;
  if (lower.startsWith("fd") || lower.startsWith("fc")) return true;
  return false;
}

async function assertPublicUrl(urlString) {
  const parsed = new URL(urlString);
  const hostname = parsed.hostname;
  if (!hostname) throw new UrlSafetyError("URL-l puudub host.");

  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new UrlSafetyError("Privaatvõrgu URL-e ei saa indekseerida.");
    }
    return;
  }

  const hostLower = hostname.toLowerCase();
  if (
    hostLower === "localhost" ||
    hostLower === "ip6-localhost" ||
    hostLower.endsWith(".localhost")
  ) {
    throw new UrlSafetyError("Privaatvõrgu URL-e ei saa indekseerida.");
  }

  try {
    const records = await dns.lookup(hostname, { all: true });
    const forbidden = records.some((r) => isPrivateAddress(r.address));
    if (forbidden) throw new UrlSafetyError("Privaatvõrgu URL-e ei saa indekseerida.");
  } catch (err) {
    if (err?.code === "ENOTFOUND" || err?.code === "EAI_AGAIN") {
      throw new UrlSafetyError("URL hosti ei õnnestunud lahendada.");
    }
    if (err instanceof UrlSafetyError) throw err;
    throw new UrlSafetyError("URL-i kontroll ebaõnnestus.", 400, { code: err?.code });
  }
}

function parseStringList(raw, max = 12) {
  if (!raw) return [];
  try {
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith("[")) {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) {
          return arr
            .map((v) => (typeof v === "string" ? v.trim() : ""))
            .filter(Boolean)
            .slice(0, max);
        }
        return [];
      }
      return trimmed
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, max);
    }
    if (Array.isArray(raw)) {
      return raw
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean)
        .slice(0, max);
    }
  } catch {
    return [];
  }
  return [];
}

function parsePages(raw) {
  if (!raw) return [];
  try {
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith("[")) {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) {
          return arr
            .map((v) => Number(v))
            .filter((n) => Number.isFinite(n))
            .slice(0, 50);
        }
        return [];
      }
      return trimmed
        .split(/[,;\s]+/)
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n))
        .slice(0, 50);
    }
    if (Array.isArray(raw)) {
      return raw
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n))
        .slice(0, 50);
    }
  } catch {
    return [];
  }
  return [];
}

function parseYear(raw) {
  if (!raw) return null;
  const year = Number(raw);
  if (!Number.isFinite(year)) return null;
  if (year < 1800 || year > 2100) return null;
  return year;
}

function normalizeBase(raw) {
  const t = String(raw || "").trim().replace(/\/+$/, "");
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `http://${t}`;
}

async function fetchWithRetry(url, init, tries = 2, timeoutMs = RAG_TIMEOUT_MS) {
  let lastErr;
  for (let i = 0; i < Math.max(1, tries); i++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(t);
      return res;
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      if (i < tries - 1) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }
  throw lastErr;
}

/* ------------------------- Route ------------------------- */

export async function POST(req) {
  const t0 = Date.now();

  const admin = await requireAdmin();
  if (!admin.ok) return makeError(admin.message, admin.status);

  let body;
  try {
    body = await req.json();
  } catch {
    return makeError("Keha peab olema JSON.");
  }

  const url = sanitizeUrl(body?.url);
  if (!url) return makeError("Palun sisesta korrektne URL.");
  try {
    await assertPublicUrl(url);
  } catch (err) {
    if (err instanceof UrlSafetyError) {
      return makeError(err.message, err.status, err.extras);
    }
    return makeError("URL-i kontroll ebaõnnestus.");
  }

  const title =
    body?.title && typeof body.title === "string"
      ? body.title.trim().substring(0, 255)
      : null;

  const description =
    body?.description && typeof body.description === "string"
      ? body.description.trim().substring(0, 2000)
      : null;

  const audience = normalizeAudience(body?.audience);
  if (!audience) return makeError("Palun vali sihtgrupp.");

  // valikulised meta + docId
  const formDocId =
    body?.docId && typeof body.docId === "string" ? body.docId.trim() : null;

  const authors = parseStringList(body?.authors, 12);
  const issueId =
    typeof body?.issueId === "string" ? body.issueId.trim().slice(0, 160) : null;
  const issueLabel =
    typeof body?.issueLabel === "string" ? body.issueLabel.trim().slice(0, 160) : null;
  const year = parseYear(body?.year);
  const articleId =
    typeof body?.articleId === "string" ? body.articleId.trim().slice(0, 200) : null;
  const section =
    typeof body?.section === "string" ? body.section.trim().slice(0, 160) : null;
  const pages = parsePages(body?.pages);
  const pageRange =
    typeof body?.pageRange === "string" ? body.pageRange.trim().slice(0, 120) : null;
  const journalTitle =
    typeof body?.journalTitle === "string" ? body.journalTitle.trim().slice(0, 255) : null;

  const ragBaseRaw = (process.env.RAG_API_BASE || "").trim();
  const ragBase = normalizeBase(ragBaseRaw);
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();
  if (!ragBase) return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);
  if (!apiKey) return makeError("RAG_SERVICE_API_KEY puudub serveri keskkonnast.", 500);

  const remoteDocId = formDocId || randomUUID();

  // forward trace headers kui olemas
  const fwdReqId = req.headers.get("x-request-id");
  const fwdClientId = req.headers.get("x-client-id");

  try {
    const payload = {
      docId: remoteDocId,
      url,
      title: title || undefined,
      description: description || undefined,
      audience,
      ...(authors.length ? { authors } : {}),
      ...(issueId ? { issueId } : {}),
      ...(issueLabel ? { issueLabel } : {}),
      ...(typeof year === "number" ? { year } : {}),
      ...(articleId ? { articleId } : {}),
      ...(section ? { section } : {}),
      ...(pages.length ? { pages } : {}),
      ...(pageRange ? { pageRange } : {}),
      ...(journalTitle ? { journalTitle } : {}),
    };

    const res = await fetchWithRetry(
      `${ragBase.replace(/\/+$/, "")}/ingest/url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "SotsiaalAI-RAG-Admin/1.0",
          "X-API-Key": apiKey,
          ...(fwdReqId ? { "X-Request-Id": fwdReqId } : {}),
          ...(fwdClientId ? { "X-Client-Id": fwdClientId } : {}),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
      2,
      RAG_TIMEOUT_MS
    );

    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = { raw: typeof raw === "string" ? raw.slice(0, 500) : null };
    }

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG viga (${res.status})`;
      const status = res.status >= 400 && res.status < 600 ? res.status : 502;
      const code =
        status === 413
          ? "PAYLOAD_TOO_LARGE"
          : status === 415
          ? "UNSUPPORTED_MIME"
          : "RAG_BACKEND_ERROR";
      console.warn(`[RAG url] FAIL(${status}, ${code}) ${url} in ${Date.now() - t0}ms: ${msg}`);
      return makeError(msg, status, { code, response: data });
    }

    // --- LOKAALNE DB LOGI ---
    let dbDoc = null;
    try {
      const createData = {
        title,
        description,
        type: "URL",
        status: "COMPLETED", // või "PROCESSING" kui soovid peegeldada taustaindekseerimist
        audience,
        sourceUrl: url,
        fileName: null,
        mimeType: null,
        fileSize: null,
        remoteId: remoteDocId,
        insertedAt: new Date(),
        metadata: {
          ...data,
          _uploadMeta: {
            authors,
            issueId,
            issueLabel,
            year,
            articleId,
            section,
            pages,
            pageRange,
            journalTitle,
          },
        },
      };
      if (admin.userId) {
        createData.admin = { connect: { id: admin.userId } };
      }
      dbDoc = await prisma.ragDocument.create({ data: createData });
    } catch (e) {
      console.warn("[RAG url] DB create ebaõnnestus:", e?.message || e);
    }

    const now = new Date().toISOString();
    console.info(`[RAG url] OK ${url} in ${Date.now() - t0}ms`);
    return NextResponse.json(
      {
        ok: true,
        warning: dbDoc
          ? undefined
          : "URL indekseeriti, kuid lokaalsesse andmebaasi salvestus ebaõnnestus.",
        doc: {
          id: dbDoc?.id || remoteDocId,
          dbId: dbDoc?.id || null,
          title,
          description,
          type: "URL",
          status: dbDoc?.status || "COMPLETED",
          sourceUrl: url,
          audience,
          createdAt: dbDoc?.createdAt?.toISOString?.() || now,
          updatedAt: dbDoc?.updatedAt?.toISOString?.() || now,
          insertedAt: dbDoc?.insertedAt?.toISOString?.() || now,
          remoteId: remoteDocId,
        },
        rag: data,
      },
      { headers: NO_STORE }
    );
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "RAG päring aegus (timeout)."
        : `RAG ühenduse viga: ${err?.message || String(err)}`;
    console.warn(`[RAG url] FAIL ${url} in ${Date.now() - t0}ms: ${message}`);
    return makeError(message, 502);
  }
}
