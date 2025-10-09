// app/api/rag/url/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { isAdmin } from "@/lib/authz";
import dns from "node:dns/promises";
import { isIP } from "node:net";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AUDIENCE_VALUES = new Set(["SOCIAL_WORKER", "CLIENT", "BOTH"]);
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

/* ------------------------- Helpers ------------------------- */

class UrlSafetyError extends Error {
  constructor(message, status = 400, extras = {}) {
    super(message);
    this.status = status;
    this.extras = extras;
  }
}

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
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
    // lubame ainult http/https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

    // keelame localhosti/loopbacki hostid nimede järgi (IP kontroll allpool)
    const hostLower = parsed.hostname.toLowerCase();
    if (
      hostLower === "localhost" ||
      hostLower === "ip6-localhost" ||
      hostLower.endsWith(".localhost")
    ) {
      return null;
    }

    // stripime fragmenti (pole sisu jaoks oluline; hoiab deduplit puhtamana)
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function isPrivateAddress(address) {
  if (!address) return false;
  // IPv4 loopback/erivõrgud
  if (address.startsWith("127.")) return true;
  if (address === "0.0.0.0" || address === "255.255.255.255") return true;

  const parts = address.split(".").map((p) => Number(p));
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true; // link-local
  }

  // IPv6
  const lower = address.toLowerCase();
  if (lower === "::1" || lower === "::") return true;           // loopback/unspecified
  if (lower.startsWith("fe80")) return true;                    // link-local
  if (lower.startsWith("fd") || lower.startsWith("fc")) return true; // unique local
  return false;
}

async function assertPublicUrl(urlString) {
  const parsed = new URL(urlString);
  const hostname = parsed.hostname;
  if (!hostname) throw new UrlSafetyError("URL-l puudub host.");

  // Kui on IP otse, kontrollime privaatset vahemikku
  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new UrlSafetyError("Privaatvõrgu URL-e ei saa indekseerida.");
    }
    return;
  }

  // Nime põhised keelud (localhost jms)
  const hostLower = hostname.toLowerCase();
  if (
    hostLower === "localhost" ||
    hostLower === "ip6-localhost" ||
    hostLower.endsWith(".localhost")
  ) {
    throw new UrlSafetyError("Privaatvõrgu URL-e ei saa indekseerida.");
  }

  // DNS lookup – kui mõni A/AAAA lahendub privaatvõrku, keelame
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

/* ------------------------- Route ------------------------- */

export async function POST(req) {
  const t0 = Date.now();

  // Auth
  const session = await getServerSession(authConfig);
  if (!session) return makeError("Pole sisse logitud", 401);
  if (!isAdmin(session?.user)) return makeError("Ligipääs keelatud", 403);

  // Body
  let body;
  try {
    body = await req.json();
  } catch {
    return makeError("Keha peab olema JSON.");
  }

  // URL & publikud
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

  // RAG backend
  const ragBase = process.env.RAG_API_BASE;
  const apiKey = process.env.RAG_API_KEY || "";
  if (!ragBase) return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);

  const docId = randomUUID();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

    const payload = {
      docId,
      url,
      title: title || undefined,
      description: description || undefined,
      audience,
    };

    const doFetch = () =>
      fetch(`${ragBase}/ingest/url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      });

    // 1 kiire retry väikese backoffiga (võrgukrambi vastu)
    let res;
    try {
      res = await doFetch();
    } catch (e) {
      await new Promise((r) => setTimeout(r, 300));
      res = await doFetch();
    }

    clearTimeout(timeout);

    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = { raw }; // mitte-JSON vastus diagnostikaks
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

    // Tagasta UI-le hetkeline kirje (kui Prisma logi ei tehta siin)
    const now = new Date().toISOString();
    console.info(`[RAG url] OK ${url} in ${Date.now() - t0}ms`);
    return NextResponse.json({
      ok: true,
      doc: {
        id: docId,
        title,
        description,
        type: "URL",
        status: "COMPLETED",
        sourceUrl: url,
        audience,
        createdAt: now,
        updatedAt: now,
        insertedAt: now,
        remoteId: docId,
      },
      rag: data,
    });
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "RAG päring aegus (timeout)."
        : `RAG ühenduse viga: ${err?.message || String(err)}`;
    console.warn(`[RAG url] FAIL ${url} in ${Date.now() - t0}ms: ${message}`);
    return makeError(message, 502);
  }
}
