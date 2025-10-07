// app/api/rag/url/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { isAdmin } from "@/lib/authz";
import dns from "node:dns/promises";
import { isIP } from "node:net";
import { randomUUID } from "node:crypto"; // ⬅️ lisatud

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AUDIENCE_VALUES = new Set(["SOCIAL_WORKER", "CLIENT", "BOTH"]);

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
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
function isPrivateAddress(address) {
  if (!address) return false;
  if (address.startsWith("127.")) return true;
  if (address === "0.0.0.0" || address === "255.255.255.255") return true;

  const parts = address.split(".").map((p) => Number(p));
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }

  const lower = address.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("fd")) return true;   // unique local
  return false;
}
async function assertPublicUrl(urlString) {
  const parsed = new URL(urlString);
  const hostname = parsed.hostname;
  if (!hostname) throw new UrlSafetyError("URL-l puudub host.");

  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new UrlSafetyError("Privaatvõrgu URL-e ei saa indekseerida.");
    return;
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

export async function POST(req) {
  const session = await getServerSession(authConfig);
  if (!session) return makeError("Pole sisse logitud", 401);
  if (!isAdmin(session?.user)) return makeError("Ligipääs keelatud", 403);

  // loe body
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

  const title = body?.title ? String(body.title).trim().slice(0, 255) : null;
  const description = body?.description ? String(body.description).trim().slice(0, 2000) : null;
  const audience = normalizeAudience(body?.audience);
  if (!audience) return makeError("Palun vali sihtgrupp.");

  // --- saade RAG teenusele ---
  const ragBase = process.env.RAG_API_BASE;
  const apiKey = process.env.RAG_API_KEY || "";
  if (!ragBase) return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);

  const docId = randomUUID(); // ⬅️ UUID siit

  try {
    const controller = new AbortController();                 // ⬅️ timeout
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const res = await fetch(`${ragBase}/ingest/url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        docId,
        url,
        title: title || undefined,
        description: description || undefined,
        audience,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const raw = await res.text();
    const data = raw ? JSON.parse(raw) : null;

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG viga (${res.status})`;
      return makeError(msg, res.status >= 400 && res.status < 600 ? res.status : 502, {
        response: data,
      });
    }

    // Tagastame UI-le "sünteetilise" kirje (ilma Prisma DB-ta)
    const now = new Date().toISOString();
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
    return makeError(message, 502);
  }
}
